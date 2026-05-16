from docx import Document
from pypdf import PdfReader

class FileReaderService:
    def read_docx(self, file_path: str) -> str:
        document = Document(file_path)

        paragraphs = [
            p.text.strip()
            for p in document.paragraphs
            if p.text.strip()
        ]

        return "\n".join(paragraphs)

    def read_pdf(self, file_path: str) -> str:
        reader = PdfReader(file_path)
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text.strip())
        return "\n".join(text_parts)

file_reader_service = FileReaderService()
