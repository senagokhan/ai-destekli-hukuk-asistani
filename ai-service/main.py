from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path
from fastapi import HTTPException

# -----------------------------
# OPENROUTER CLIENT AYARLARI
# -----------------------------
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# -----------------------------
# PDF VE EMBEDDING SERVİSLERİ
# -----------------------------
from pdf_processor import extract_pdf_text, extract_and_chunk_pdf

from embedding_service import (
    create_embeddings_from_chunks,
    save_faiss_index,
    embed_query,
    load_faiss_index
)

app = FastAPI(title="Legal AI Service")


# -----------------------------
# OpenRouter Chat Fonksiyonu
# -----------------------------
def call_openai(prompt: str) -> str:
    response = client.chat.completions.create(
        model="mistralai/mistral-nemo",
        messages=[
            {"role": "system", "content": "Sen hukuki belgeleri analiz eden Türkçe yanıt veren bir yapay zekâ asistansın."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content


# indexes klasörü yoksa oluştur
os.makedirs("indexes", exist_ok=True)


# -----------------------------
# MODELLER
# -----------------------------
class PdfIngestRequest(BaseModel):
    file_path: str

class PdfIngestResponse(BaseModel):
    pages: int
    total_chars: int
    text_by_page: list[str]

class PdfChunkRequest(BaseModel):
    file_path: str

class PdfChunkResponse(BaseModel):
    chunks: list[dict]

class EmbeddingCreateRequest(BaseModel):
    file_path: str
    index_path: str = "faiss_index.index"

class QueryRequest(BaseModel):
    query: str
    index_name: str
    top_k: int = 3


# -----------------------------
# PDF METİN ÇIKARMA ENDPOINT
# -----------------------------
@app.post("/pdf/extract", response_model=PdfIngestResponse)
def extract_pdf(req: PdfIngestRequest):
    text_pages = extract_pdf_text(req.file_path)
    total_chars = sum(len(t) for t in text_pages)

    return PdfIngestResponse(
        pages=len(text_pages),
        total_chars=total_chars,
        text_by_page=text_pages
    )


# -----------------------------
# PDF CHUNK OLUŞTURMA
# -----------------------------
@app.post("/pdf/chunk", response_model=PdfChunkResponse)
def chunk_pdf(req: PdfChunkRequest):
    chunks = extract_and_chunk_pdf(req.file_path)
    return PdfChunkResponse(chunks=chunks)


# -----------------------------
# EMBEDDING + FAISS INDEX
# -----------------------------
@app.post("/embeddings/create")
def create_embeddings(req: EmbeddingCreateRequest):
    chunks = extract_and_chunk_pdf(req.file_path)
    embeddings, metadata = create_embeddings_from_chunks(chunks)

    save_faiss_index(embeddings, metadata, req.index_path)

    return {
        "status": "ok",
        "chunks": len(chunks),
        "index_path": req.index_path
    }


# -----------------------------
# RETRIEVAL (Sadece Chunk Getirme)
# -----------------------------
@app.post("/query")
def query_embeddings(req: QueryRequest):
    try:
        index, metadata = load_faiss_index(req.index_path)
    except Exception:
        raise HTTPException(status_code=404, detail="Index not found.")

    q_emb = embed_query(req.query)
    distances, indices = index.search(q_emb, req.top_k)

    results = []
    for i, idx in enumerate(indices[0]):
        if idx == -1:
            continue

        meta = metadata[idx]
        results.append({
            "distance": float(distances[0][i]),
            "chunk": meta.get("text"),
            "page": meta.get("page"),
            "chunk_index": meta.get("chunk_index")
        })

    return {"query": req.query, "results": results}


# -----------------------------
# RAG: Chunk + LLM Cevap
# -----------------------------
@app.post("/rag/answer")
def rag_answer(req: QueryRequest):

    # 1️⃣ AI service'in kendi index klasörü
    BASE_INDEX_DIR = Path(__file__).resolve().parent / "indexes"

    # 2️⃣ Backend'ten gelen index adı (örn: "27.index")
    index_name = req.index_name

    # 3️⃣ Gerçek dosya yolu
    index_path = BASE_INDEX_DIR / index_name

    # 4️⃣ Index var mı?
    if not index_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Index not found: {index_path}"
        )

    # 5️⃣ FAISS index + metadata yükle
    try:
        index, metadata = load_faiss_index(str(index_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 6️⃣ Query embedding
    q_emb = embed_query(req.query)

    distances, indices = index.search(q_emb, req.top_k)

    context_chunks = []
    for idx in indices[0]:
        if idx == -1:
            continue
        text = metadata[idx].get("text")
        if text:
            context_chunks.append(text)

    context = "\n\n---\n\n".join(context_chunks)

    prompt = f"""
Aşağıdaki bağlamdan faydalanarak soruya net ve hukuki olarak doğru bir cevap üret:

Soru:
{req.query}

Bağlam:
{context}

Cevap:
"""

    answer = call_openai(prompt)

    return {
        "query": req.query,
        "answer": answer,
        "context_used": context,
        "retrieved_chunks": len(context_chunks)
    }
