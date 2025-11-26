import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


# ------------------------------------------------------------
# 1) MODEL YÜKLEME
# ------------------------------------------------------------
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device="cpu")


# ------------------------------------------------------------
# 2) CHUNK METİNLERİNDEN EMBEDDING OLUŞTURMA
# ------------------------------------------------------------
def create_embeddings_from_chunks(chunks: list[dict]) -> tuple[np.ndarray, list[dict]]:
    """
    Chunk listesinden vektör embedding üretir.
    Dönen değer:
      - numpy array (FAISS için)
      - metadata listesi
    """
    texts = [chunk["text"] for chunk in chunks]
    metadata = [{"page": c["page"], "chunk_index": c["chunk_index"]} for c in chunks]

    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)

    return embeddings, metadata


# ------------------------------------------------------------
# 3) FAISS INDEX OLUŞTURMA ve KAYDETME
# ------------------------------------------------------------
def save_faiss_index(embeddings: np.ndarray, metadata: list[dict], index_path: str):
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    # FAISS index kaydet
    faiss.write_index(index, index_path)

    # Metadata kaydet
    np.save(index_path + "_metadata.npy", metadata)


# ------------------------------------------------------------
# 4) FAISS INDEX YÜKLEME
# ------------------------------------------------------------
def load_faiss_index(index_path: str):
    index = faiss.read_index(index_path)
    metadata = np.load(index_path + "_metadata.npy", allow_pickle=True).tolist()
    return index, metadata


# ------------------------------------------------------------
# 5) SORU EMBEDDING'İ OLUŞTURMA
# ------------------------------------------------------------
def embed_query(query: str):
    return model.encode([query], convert_to_numpy=True)
