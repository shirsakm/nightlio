import os
import numpy as np
from google.genai import Client
import logging

logger = logging.getLogger(__name__)

class InsightService:
    def __init__(self, db):
        self.db = db
        # Single client for both Embeddings and Chat
        self.client = Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.chat_model = "gemini-2.5-flash"
        self.embed_model = "gemini-embedding-001"

    def get_connection_insight(self, user_id, current_content):
        try:
            past_entries = self.db.get_all_mood_entries(user_id)
            valid_past_entries = [e for e in past_entries if e['content'] != current_content]

            if not valid_past_entries:
                return "First entry! Keep writing and I'll find patterns soon. ✨"

            # 1. Vector Search via API
            # Get embedding for current entry
            current_resp = self.client.models.embed_content(
                model=self.embed_model,
                contents=current_content,
                config={'task_type': 'SEMANTIC_SIMILARITY'}
            )
            current_vec = np.array(current_resp.embeddings[0].values)

            # Get embeddings for all past entries
            past_contents = [e['content'] for e in valid_past_entries]
            past_resp = self.client.models.embed_content(
                model=self.embed_model,
                contents=past_contents,
                config={'task_type': 'SEMANTIC_SIMILARITY'}
            )
            # Convert list of embedding objects to a numpy matrix
            past_vecs = np.array([emb.values for emb in past_resp.embeddings])
            
            # 2. Cosine Similarity Calculation
            # Formula: (A dot B) / (norm(A) * norm(B))
            dot_product = np.dot(past_vecs, current_vec)
            norms = np.linalg.norm(past_vecs, axis=1) * np.linalg.norm(current_vec)
            
            # Divide and handle potential zeros
            similarities = np.divide(dot_product, norms, out=np.zeros_like(dot_product), where=norms!=0)
            
            # 3. Get Top 3 Indices
            top_indices = np.argsort(similarities)[-3:][::-1]
            
            related_memories = []
            for idx in top_indices:
                # 0.40 is a safe threshold for semantic closeness
                if similarities[idx] > 0.40:
                    related_memories.append(valid_past_entries[idx]['content'])

            # Fallback to the single most similar entry if none passed the threshold
            if not related_memories:
                related_memories = [valid_past_entries[top_indices[0]]['content']]

            return self._summarize_with_llm(current_content, related_memories)

        except Exception as e:
            logger.error(f"RAG search error: {str(e)}")
            return "Reflection is the first step to growth!"

    def _summarize_with_llm(self, current, past):
        past_context = "\n- ".join(past)
        
        # Console output for your demo to prove the RAG works
        print(f"--- RAG Context Retrieved ({len(past)} memories) ---")

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