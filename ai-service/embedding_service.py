import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


# MODEL YÜKLEME
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device="cpu")


categories = {
    "IS_HUKUKU": "işçi işveren kıdem tazminatı iş sözleşmesi fesih işe iade mesai",
    "CEZA_HUKUKU": "sanık savcı ceza suçu suç mahkeme iddianame beraat mahkumiyet",
    "TICARET_HUKUKU": "ticari şirket ortaklık çek senet fatura ticaret alacak",
    "AILE_HUKUKU": "boşanma velayet nafaka eş evlilik aile",
    "BORCLAR_HUKUKU": "borç alacak sözleşme tazminat yükümlülük",
    "ICRA_IFLAS": "icra haciz iflas takip borçlu alacaklı",
    "TUKETICI_HUKUKU": "tüketici ayıplı mal cayma bedel iade satıcı",
    "DIGER": "hukuki uyuşmazlık dava dilekçe karar mahkeme"
}

def classify_case_text(text: str):
    text_embedding = model.encode(text)

    best_score = -1
    best_category = "DIGER"

    for cat, desc in categories.items():
        desc_embedding = model.encode(desc)
        score = util.cos_sim(text_embedding, desc_embedding).item()

        if score > best_score:
            best_score = score
            best_category = cat

    return {
        "predictedCaseType": best_category,
        "confidenceScore": float(best_score),
        "summaryReason": "Embedding similarity classification"
    }
    

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
