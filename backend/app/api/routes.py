from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from fastapi import UploadFile, File

import shutil
import uuid
import os
import logging

from app.schemas.text import (
    TextResponse,
    DetailedSpellCheckResponse,
    SpellCheckResult,
    TranslateRequest,
    ModifyRequest,
    SpellCheckRequest,
    RewriteRequest,
    TextRequest
)

from app.services.ai_service import ai_service
from app.services.spellcheck_service import spell_service
from app.services.report_service import report_service
from app.services.word_report_service import word_report_service
from app.services.file_reader_service import file_reader_service
from app.schemas.text import FileAnalysisResponse



router = APIRouter()
logger = logging.getLogger(__name__)

# Helpers
def remove_file(path: str) -> None:
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.error(f"Failed to delete file {path}: {e}")


def make_response(
    original: str,
    processed: str,
    action: str,
    errors: int = 0
) -> TextResponse:
    return TextResponse(
        original_text=original,
        processed_text=processed,
        action=action,
        char_count=len(original),
        word_count=len(original.split()),
        error_count=errors
    )

# Routes
@router.post("/check", response_model=DetailedSpellCheckResponse)
async def check_grammar(request: SpellCheckRequest):
    try:
        corrected_text, mistakes_list = spell_service.get_detailed_stats(request.text)
        style_text = await ai_service.improve_style(request.text)

        return DetailedSpellCheckResponse(
            original_text=request.text,
            char_count=len(request.text),
            word_count=len(request.text.split()),
            result=SpellCheckResult(
                corrected=corrected_text,
                style_improved=style_text,
                mistakes=mistakes_list
            )
        )

    except Exception as e:
        logger.exception("Spell check failed")
        raise HTTPException(status_code=500, detail="Spell check error")


@router.post("/translate", response_model=TextResponse)
async def translate_text(request: TranslateRequest):
    try:
        result = await ai_service.translate(request.text, request.target_language)
        return make_response(request.text, result, "translate")

    except Exception as e:
        logger.exception("Translate failed")
        raise HTTPException(status_code=500, detail="Translation error")


@router.post("/summarize", response_model=TextResponse)
async def summarize_text(request: ModifyRequest):
    try:
        result = await ai_service.summarize(request.text, request.percentage)
        return make_response(request.text, result, "summarize")

    except Exception:
        logger.exception("Summarize failed")
        raise HTTPException(status_code=500, detail="Summarization error")


@router.post("/expand", response_model=TextResponse)
async def expand_text(request: ModifyRequest):
    try:
        result = await ai_service.expand(request.text, request.percentage)
        return make_response(request.text, result, "expand")

    except Exception:
        logger.exception("Expand failed")
        raise HTTPException(status_code=500, detail="Text expansion error")


@router.post("/rewrite", response_model=TextResponse)
async def rewrite_text(request: RewriteRequest):
    try:
        result = await ai_service.rewrite(request.text)
        return make_response(request.text, result, "rewrite")

    except Exception:
        logger.exception("Rewrite failed")
        raise HTTPException(status_code=500, detail="Rewrite error")


@router.post("/report/pdf")
async def get_pdf_report(
    request: TextRequest,
    background_tasks: BackgroundTasks
):
    try:
        if request.custom_title and request.custom_title.strip():
            title = request.custom_title
        else:
            title = await ai_service.generate_title(request.text)

        file_path = report_service.generate_pdf(request.text, title)

        background_tasks.add_task(remove_file, file_path)

        return FileResponse(
            path=file_path,
            filename="AI_Report.pdf",
            media_type="application/pdf"
        )

    except Exception:
        logger.exception("PDF generation failed")
        raise HTTPException(status_code=500, detail="PDF generation error")
    

@router.post("/report/word")
async def get_word_report(
    request: TextRequest,
    background_tasks: BackgroundTasks
):
    try:
        if request.custom_title and request.custom_title.strip():
            title = request.custom_title
        else:
            title = await ai_service.generate_title(request.text)

        file_path = word_report_service.generate_docx(
            request.text,
            title
        )

        background_tasks.add_task(remove_file, file_path)

        return FileResponse(
            path=file_path,
            filename="AI_Report.docx",
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            )
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Word report generation error"
        )
    
    
@router.post("/analyze/word", response_model=FileAnalysisResponse)
async def analyze_word_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Only .docx files are supported")

    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)

    temp_path = os.path.join(
        temp_dir,
        f"{uuid.uuid4()}_{file.filename}"
    )

    try:
        # зберігаємо файл
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # читаємо текст
        text = file_reader_service.read_docx(temp_path)

        if not text.strip():
            raise HTTPException(status_code=400, detail="Document is empty")

        # spellcheck
        corrected_text, mistakes = spell_service.get_detailed_stats(text)

        # summary
        summary = await ai_service.describe_text(text)

        return FileAnalysisResponse(
            filename=file.filename,
            char_count=len(text),
            word_count=len(text.split()),
            summary=summary,
            spellcheck=SpellCheckResult(
                corrected=corrected_text,
                style_improved=await ai_service.improve_style(text),
                mistakes=mistakes
            )
        )

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


