from fpdf import FPDF
import os
import uuid

class ReportService:
    def generate_pdf(self, text: str, title: str = "AI Analysis Report") -> str:
        pdf = FPDF()
        pdf.add_page()

        #стандартний шрифт
        pdf.set_font("Helvetica", size=12)

        #очищення
        safe_text = text.encode('latin-1', 'replace').decode('latin-1')
        safe_title = title.encode('latin-1', 'replace').decode('latin-1')

        #заголовок
        pdf.set_font("Helvetica", style="B", size=16)
        pdf.cell(0, 10, safe_title, 0, 1, "C")
        pdf.ln(10)

        pdf.set_font("Helvetica", size=12)
        pdf.cell(0, 10, f"Characters: {len(text)}", 0, 1)
        pdf.cell(0, 10, f"Words: {len(text.split())}", 0, 1)
        pdf.ln(10)
    
        pdf.set_font("Helvetica", size=11)
        pdf.multi_cell(0, 10, safe_text)

        #збереження
        temp_dir = "temp_reports"
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        filename = os.path.join(temp_dir, f"report_{uuid.uuid4()}.pdf")
        pdf.output(filename)

        return filename

report_service = ReportService()