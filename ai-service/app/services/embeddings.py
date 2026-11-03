"""
Sentence embedding service for semantic similarity matching.
Uses Sentence Transformers when available, with automatic TF-IDF fallback.
"""
import numpy as np
from typing import List, Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Manages sentence transformer model and provides embedding operations."""

    def __init__(self):
        self._model = None
        self._has_st = None

    def _get_model(self):
        """Lazy-load the sentence transformer model."""
        if self._has_st is False:
            return None

        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
                self._has_st = True
                logger.info("Embedding model loaded successfully")
            except Exception as e:
                logger.info(f"SentenceTransformer optional ({e}), falling back to TF-IDF semantic vectorizer")
                self._has_st = False
                self._model = None
        return self._model

    def encode(self, texts: List[str]) -> np.ndarray:
        model = self._get_model()
        if model is not None:
            return model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return self._tfidf_encode(texts)

    def _tfidf_encode(self, texts: List[str]) -> np.ndarray:
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            vectorizer = TfidfVectorizer(max_features=512, stop_words='english')
            X = vectorizer.fit_transform(texts)
            return X.toarray()
        except Exception:
            # Word frequency vectorizer fallback
            vocab = {}
            for t in texts:
                for w in t.lower().split():
                    if len(w) > 2 and w not in vocab:
                        vocab[w] = len(vocab)
            arr = np.zeros((len(texts), max(1, len(vocab))))
            for i, t in enumerate(texts):
                for w in t.lower().split():
                    if w in vocab:
                        arr[i, vocab[w]] += 1
            norms = np.linalg.norm(arr, axis=1, keepdims=True)
            norms[norms == 0] = 1
            return arr / norms

    def compute_similarity(self, text1: str, text2: str) -> float:
        embeddings = self.encode([text1, text2])
        norm1 = np.linalg.norm(embeddings[0])
        norm2 = np.linalg.norm(embeddings[1])
        if norm1 == 0 or norm2 == 0:
            return 0.5
        similarity = np.dot(embeddings[0], embeddings[1]) / (norm1 * norm2)
        return float(max(0, min(1, similarity)))

    def compute_batch_similarity(self, query: str, documents: List[str]) -> List[float]:
        if not documents:
            return []

        all_texts = [query] + documents
        embeddings = self.encode(all_texts)

        query_embedding = embeddings[0]
        q_norm = np.linalg.norm(query_embedding)
        doc_embeddings = embeddings[1:]

        similarities = []
        for doc_emb in doc_embeddings:
            d_norm = np.linalg.norm(doc_emb)
            if q_norm == 0 or d_norm == 0:
                similarities.append(0.5)
            else:
                sim = np.dot(query_embedding, doc_emb) / (q_norm * d_norm)
                similarities.append(float(max(0, min(1, sim))))

        return similarities


embedding_service = EmbeddingService()
