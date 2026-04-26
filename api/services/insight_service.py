import os
import numpy as np
from sentence_transformers import SentenceTransformer
from google.genai import Client
import logging

logger = logging.getLogger(__name__)

class InsightService:
    def __init__(self, db):
        self.db = db
        # Gemini Client for the final step
        self.client = Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.chat_model = "gemini-2.5-flash"
        
        # Keeping your local embedding model
        self._model = None

    @property
    def model(self):
        if self._model is None:
            logger.info("Loading SentenceTransformer model...")
            self._model = SentenceTransformer('all-MiniLM-L6-v2')
        return self._model

    def get_connection_insight(self, user_id, current_content):
        try:
            past_entries = self.db.get_all_mood_entries(user_id)
            valid_past_entries = [e for e in past_entries if e['content'] != current_content]

            if not valid_past_entries:
                return "First entry! Keep writing and I'll find patterns soon. ✨"

            # 1. Vector Search (Using Local SentenceTransformers)
            current_vec = self.model.encode([current_content])
            past_contents = [e['content'] for e in valid_past_entries]
            past_vecs = self.model.encode(past_contents)
            
            # 2. Cosine Similarity Math
            similarities = np.dot(past_vecs, current_vec.T).flatten()
            
            # 3. Get Top 3 Indices
            top_indices = np.argsort(similarities)[-3:][::-1]
            
            related_memories = []
            for idx in top_indices:
                if similarities[idx] > 0.30:
                    related_memories.append(valid_past_entries[idx]['content'])

            # Fallback
            if not related_memories:
                related_memories = [valid_past_entries[top_indices[0]]['content']]

            return self._summarize_with_llm(current_content, related_memories)

        except Exception as e:
            logger.error(f"RAG search error: {str(e)}")
            return "Reflection is the first step to growth!"

    def _summarize_with_llm(self, current, past):
        """Calls Gemini 2.5 Flash for the final response"""
        past_context = "\n- ".join(past)

        # Debug print for your console
        print("\n" + " ✨ " * 10)
        print(f"RAG DATA EXCHANGE (Top-{len(past)} Retrieval):")
        print(f"  > Context (Past):\n- {past_context}")
        print(f"  > Input (Today): {current}")
        print(" ✨ " * 10 + "\n")

        prompt = (
            "You are a warm and encouraging journaling assistant. Your tone is supportive but grounded. "
            "Connect today's entry to the SPECIFIC details in the past memories provided. "
            "When you connect to the past, frame it as 'I see in your past entries...' or 'You've written before about...'. "
            "1. Mention a specific detail from the past. "
            "2. Match the user's energy. "
            "3. Keep it under 3 sentences."
            "4. Give a quick wellness tip."
            f"\n\nPAST MEMORIES:\n- {past_context}"
            f"\n\nTODAY'S THOUGHT: '{current}'"
        )

        try:
            response = self.client.models.generate_content(
                model=self.chat_model,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini Summarization failed: {str(e)}")
            return "You've shared similar thoughts before. Reflection helps you grow."