import fitz  # PyMuPDF
import re


# ---------------------------------------------------
# 1) PDF'TEN SAYFA SAYFA METİN ÇIKARMA
# ---------------------------------------------------
def extract_pdf_text(file_path: str) -> list[str]:
    """
    PDF dosyasındaki her sayfanın metnini ayrı bir string olarak döner.
    index 0 = 1. sayfa, index 1 = 2. sayfa ...
    """
    doc = fitz.open(file_path)
    pages_text = []

    for page in doc:
        text = page.get_text("text")

        # Gereksiz boşlukları temizleyelim
        cleaned = "\n".join(
            line.strip()
            for line in text.splitlines()
            if line.strip()
        )
        pages_text.append(cleaned)

    doc.close()
    return pages_text


# ---------------------------------------------------
# 2) METNİ CÜMLELERE BÖLME
# ---------------------------------------------------
SENTENCE_SPLIT_REGEX = re.compile(r'(?<=[.!?])\s+')

def split_into_sentences(text: str) -> list[str]:
    """
    Nokta, soru işareti, ünlemden sonra gelen boşluklara göre metni cümlelere ayırır.
    """
    sentences = SENTENCE_SPLIT_REGEX.split(text)
    return [s.strip() for s in sentences if s.strip()]


# ---------------------------------------------------
# 3) CÜMLELERDEN CHUNK OLUŞTURMA
# ---------------------------------------------------
def make_chunks_from_sentences(
    sentences: list[str],
    max_chars: int = 800,
    overlap: int = 1,
) -> list[str]:
    """
    Cümleleri 800 karakterlik (ayarlanabilir) chunk bloklarına ayırır.
    Bir chunk'tan diğerine geçerken "overlap" kadar cümle taşınır.
    """
    chunks = []
    current = []

    for sent in sentences:
        candidate = " ".join(current + [sent])

        if len(candidate) <= max_chars:
            current.append(sent)
        else:
            # Chunk hazır, listeye ekle
            if current:
                chunks.append(" ".join(current))

            # Overlap ayarı
            current = current[-overlap:] if overlap > 0 else []
            current.append(sent)

    # Son chunk
    if current:
        chunks.append(" ".join(current))

    return chunks


# ---------------------------------------------------
# 4) TÜM PDF'İ CHUNK'LARA AYIRMA
# ---------------------------------------------------
def extract_and_chunk_pdf(file_path: str) -> list[dict]:
    """
    PDF'teki her sayfayı cümlelere böler, chunk'lar oluşturur
    ve metadata ile birlikte liste halinde döner.
    """
    pages_text = extract_pdf_text(file_path)
    all_chunks = []

    for page_idx, text in enumerate(pages_text, start=1):
        sentences = split_into_sentences(text)
        chunks = make_chunks_from_sentences(sentences)

        for i, chunk in enumerate(chunks):
            all_chunks.append({
                "page": page_idx,
                "chunk_index": i,
                "text": chunk,
                "char_count": len(chunk)
            })

    return all_chunks
