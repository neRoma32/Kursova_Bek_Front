from docx import Document


class FileReaderService:
    def read_docx(self, file_path: str) -> str:
        document = Document(file_path)

        paragraphs = [
            p.text.strip()
            for p in document.paragraphs
            if p.text.strip()
        ]

        return "\n".join(paragraphs)


file_reader_service = FileReaderService()
