"""
Sentence embedding service for semantic similarity matching.
Uses Sentence Transformers (all-MiniLM-L6-v2) for encoding text.
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

    def _get_model(self):
        """Lazy-load the sentence transformer model."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
                logger.info("Embedding model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                raise
        return self._model

    def encode(self, texts: List[str]) -> np.ndarray:
        """
        Encode a list of texts into embeddings.

        Args:
            texts: List of text strings to encode.

        Returns:
            numpy array of shape (len(texts), embedding_dim)
        """
        model = self._get_model()
        embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings

    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Compute cosine similarity between two texts.

        Returns:
            Similarity score between 0 and 1.
        """
        embeddings = self.encode([text1, text2])
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        return float(max(0, similarity))  # Clamp to non-negative

    def compute_batch_similarity(self, query: str, documents: List[str]) -> List[float]:
        """
        Compute similarity of a query against multiple documents.

        Args:
            query: The query text (e.g., resume summary).
            documents: List of document texts (e.g., job descriptions).

        Returns:
            List of similarity scores.
        """
        if not documents:
            return []

        all_texts = [query] + documents
        embeddings = self.encode(all_texts)

        query_embedding = embeddings[0]
        doc_embeddings = embeddings[1:]

        similarities = []
        for doc_emb in doc_embeddings:
            sim = np.dot(query_embedding, doc_emb) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_emb)
            )
            similarities.append(float(max(0, sim)))

        return similarities


# Module-level singleton
embedding_service = EmbeddingService()
