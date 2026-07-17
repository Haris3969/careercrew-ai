import fitz  # pymupdf
import docx
from io import BytesIO


def parse_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def parse_docx(file_bytes: bytes) -> str:
    doc = docx.Document(BytesIO(file_bytes))
    text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    return text.strip()


def parse_resume_file(filename: str, file_bytes: bytes) -> str:
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        return parse_pdf(file_bytes)
    elif lower_name.endswith(".docx"):
        return parse_docx(file_bytes)
    else:
        raise ValueError("Unsupported file type. Please upload a PDF or DOCX file.")