import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


# MODEL YÜKLEME
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device="cpu")



# CHUNK METİNLERİNDEN EMBEDDING OLUŞTURMA
def create_embeddings_from_chunks(chunks: list[dict]) -> tuple[np.ndarray, list[dict]]:
    """
    Chunk listesinden vektör embedding üretir.
    Dönen değer:
      - numpy array (FAISS için)
      - metadata listesi
    """
    texts = [chunk["text"] for chunk in chunks]

    metadata = [
        {
            "page": c["page"],
            "chunk_index": c["chunk_index"],
            "text": c["text"]    
        }
        for c in chunks
    ]

    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)

    return embeddings, metadata


# FAISS INDEX OLUŞTURMA ve KAYDETME
def save_faiss_index(embeddings: np.ndarray, metadata: list[dict], index_path: str):
    import os, json

    abs_path = os.path.abspath(index_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    faiss.write_index(index, abs_path)

    # ► Metadata JSON olarak kaydedilir
    with open(abs_path + "_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False)

    print(f"FAISS index kaydedildi → {abs_path}")




def load_faiss_index(index_path: str):
    import os, json

    abs_path = os.path.abspath(index_path)

    index = faiss.read_index(abs_path)

    with open(abs_path + "_metadata.json", "r", encoding="utf-8") as f:
        metadata = json.load(f)

    return index, metadata




# SORU EMBEDDING'İ OLUŞTURMA
def embed_query(query: str):
    return model.encode([query], convert_to_numpy=True)
