from typing import List, Dict, Any
import io
import pypdf

class PDFParserService:
    """
    Extracts text and provenance metadata from discharge summary documents.
    Preserves page boundaries and line context so every extracted item
    can be verified against the exact source document.
    """

    @classmethod
    def extract_text_from_pdf(cls, file_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Parses PDF bytes and returns a list of pages with page number and text.
        [{"page": 1, "text": "..."}, {"page": 2, "text": "..."}]
        """
        pages_content = []
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                pages_content.append({
                    "page": i + 1,
                    "text": text.strip()
                })
        except Exception as e:
            # Fallback if raw text stream was uploaded or parsing issue
            decoded = file_bytes.decode("utf-8", errors="ignore")
            # Partition into synthetic pages if multi-page delimiter exists
            chunks = decoded.split("================================================================================")
            if len(chunks) > 1:
                for idx, chunk in enumerate(chunks):
                    if chunk.strip():
                        pages_content.append({"page": idx + 1, "text": chunk.strip()})
            else:
                pages_content.append({"page": 1, "text": decoded.strip()})
                
        if not pages_content:
            pages_content = [{"page": 1, "text": ""}]
            
        return pages_content

    @classmethod
    def get_full_text(cls, pages_content: List[Dict[str, Any]]) -> str:
        return "\n\n--- PAGE BREAK ---\n\n".join(
            [f"[Page {p['page']}]\n{p['text']}" for p in pages_content]
        )
