import os
import requests
import numpy as np
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class InsightService:
    def __init__(self, db):
        self.db = db
        # Router endpoint for OpenAI-compatible completions
        self.API_URL = "https://router.huggingface.co/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {os.getenv('HF_TOKEN')}",
            "Content-Type": "application/json"
        }
        # Model is loaded lazily to save RAM on startup
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

            # 1. Vector Search
            current_vec = self.model.encode([current_content])
            past_contents = [e['content'] for e in valid_past_entries]
            past_vecs = self.model.encode(past_contents)
            
            similarities = np.dot(past_vecs, current_vec.T).flatten()
            
            # 2. Get Top 3 Indices (Sorted by similarity descending)
            top_indices = np.argsort(similarities)[-3:][::-1]
            
            # 3. Collect related contents (only if similarity is decent)
            related_memories = []
            for idx in top_indices:
                if similarities[idx] > 0.30:
                    related_memories.append(valid_past_entries[idx]['content'])

            # Fallback if nothing was relevant enough
            if not related_memories:
                related_memories = [valid_past_entries[top_indices[0]]['content']]

            return self._summarize_with_llm(current_content, related_memories)

        except Exception as e:
            logger.error(f"RAG search error: {str(e)}")
            return "Reflection is the first step to growth!"

    def _summarize_with_llm(self, current, past):
        """Calls the HF Router with specific error handling for the Featherless provider."""
        past_context = "\n- ".join(past)

        print("\n" + " ✨ " * 10)
        print(f"RAG DATA EXCHANGE (Top-{len(past)} Retrieval):")
        print(f"  > Context (Past):\n- {past_context}")
        print(f"  > Input (Today): {current}")
        print(" ✨ " * 10 + "\n")
        payload = {
            "messages": [
                {
                    "role": "system", 
                    "content": (
                        "You are a warm and encouraging journaling assistant. Your tone is supportive but grounded. "
                        "Your goal is to connect today's entry to the SPECIFIC details in the past memories provided. "
                        "When you connect to the past, frame it as 'I see in your past entries...' or 'You've written before about...'. "
                        "1. Mention a specific detail from the past (e.g., if the past says 'biryani', mention 'biryani'). "
                        "2. If today is a celebration, match that energy! "
                        "3. If today is stressful, emphatise with them and/or remind them how they handled it in the past. "
                        "DO NOT be generic. Be concise. Acknowledge the pattern, give one encouraging word, and one quick wellness tip. "
                        "Keep it under 3 sentences."
                    )
                },
                {
                    "role": "user", 
                    "content": f"PAST MEMORIES:\n- {past_context}\n\nTODAY'S THOUGHT: '{current}'"
                }
            ],
            "model": "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
            "max_tokens": 200
        }

        try:
            response = requests.post(
                self.API_URL, 
                headers=self.headers, 
                json=payload, 
                timeout=30
            )
            
            # Check for HTTP errors before parsing
            response.raise_for_status()
            result = response.json()

            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"].strip()
            
            logger.warning(f"Unexpected API response format: {result}")
            return "You've shared similar thoughts before. Reflection helps you grow."

        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HF HTTP Error: {http_err.response.status_code} - {http_err.response.text}")
        except Exception as e:
            logger.error(f"LLM Summarization failed: {str(e)}")
            
        return "You've shared similar thoughts before. Reflection helps you grow."