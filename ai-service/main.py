from fastapi import FastAPI
from pydantic import BaseModel
from pdf_processor import extract_pdf_text
from pdf_processor import extract_and_chunk_pdf

from embedding_service import (
    create_embeddings_from_chunks,
    save_faiss_index
)


app = FastAPI(title="Legal AI Service")

class PdfIngestRequest(BaseModel):
    file_path: str

class PdfIngestResponse(BaseModel):
    pages: int
    total_chars: int
    text_by_page: list[str]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/pdf/extract", response_model=PdfIngestResponse)
def extract_pdf(req: PdfIngestRequest):
    text_pages = extract_pdf_text(req.file_path)
    total_chars = sum(len(t) for t in text_pages)

    return PdfIngestResponse(
        pages=len(text_pages),
        total_chars=total_chars,
        text_by_page=text_pages
    )

class PdfChunkRequest(BaseModel):
    file_path: str

class PdfChunkResponse(BaseModel):
    chunks: list[dict]

@app.post("/pdf/chunk", response_model=PdfChunkResponse)
def chunk_pdf(req: PdfChunkRequest):
    chunks = extract_and_chunk_pdf(req.file_path)
    return PdfChunkResponse(chunks=chunks)

class EmbeddingCreateRequest(BaseModel):
    file_path: str
    index_path: str = "faiss_index.index"


@app.post("/embeddings/create")
def create_embeddings(req: EmbeddingCreateRequest):
    # 1) PDF'i chunk'lara ayır
    chunks = extract_and_chunk_pdf(req.file_path)

    # 2) Chunk'lardan embedding oluştur
    embeddings, metadata = create_embeddings_from_chunks(chunks)

    # 3) FAISS index olarak kaydet
    save_faiss_index(embeddings, metadata, req.index_path)

    return {
        "status": "ok",
        "chunks": len(chunks),
        "index_path": req.index_path
    }
