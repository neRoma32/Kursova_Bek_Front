from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.schemas.text import (
    TextResponse, DetailedSpellCheckResponse, SpellCheckResult,
    TranslateRequest, ModifyRequest, SpellCheckRequest, RewriteRequest
)

from fastapi.responses import FileResponse
import os

from app.schemas.text import TextResponse, TranslateRequest, ModifyRequest, SpellCheckRequest, RewriteRequest, TextRequest
from app.services.ai_service import ai_service
from app.services.spellcheck_service import spell_service
from app.services.report_service import report_service

router = APIRouter()

def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"Error deleting file {path}: {e}")

def _make_response(original: str, processed: str, action: str, errors: int = 0) -> TextResponse:
    return TextResponse(
        original_text=original,
        processed_text=processed,
        action=action,
        char_count=len(original),
        word_count=len(original.split()),
        error_count=errors
    )

@router.post("/check", response_model=DetailedSpellCheckResponse)
async def check_grammar(request: SpellCheckRequest):
    #виправлення та список помилок від LanguageTool
    corrected_text, mistakes_list = spell_service.get_detailed_stats(request.text)
    
    #покращений стиль від AI
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


def _make_response(original: str, processed: str, action: str) -> TextResponse:
    return TextResponse(
        original_text=original,
        processed_text=processed,
        action=action,
        char_count=len(original),
        word_count=len(original.split())
    )

@router.post("/translate", response_model=TextResponse)
async def translate_text(request: TranslateRequest):
    result = await ai_service.translate(request.text, request.target_language)
    return _make_response(request.text, result, "translate")

@router.post("/summarize", response_model=TextResponse)
async def summarize_text(request: ModifyRequest):
    result = await ai_service.summarize(request.text, request.percentage)
    return _make_response(request.text, result, "summarize")

@router.post("/expand", response_model=TextResponse)
async def expand_text(request: ModifyRequest):
    result = await ai_service.expand(request.text, request.percentage)
    return _make_response(request.text, result, "expand")

@router.post("/rewrite", response_model=TextResponse)
async def rewrite_text(request: RewriteRequest):
    result = await ai_service.rewrite(request.text)
    return _make_response(request.text, result, "rewrite")


@router.post("/report/pdf")
async def get_pdf_report(request: TextRequest, background_tasks: BackgroundTasks):
    try:
        if request.custom_title and request.custom_title.strip():
            final_title = request.custom_title
        else:
            final_title = await ai_service.generate_title(request.text)

        file_path = report_service.generate_pdf(request.text, final_title)

        background_tasks.add_task(remove_file, file_path)

        return FileResponse(
            path=file_path,
            filename="AI_Report.pdf",
            media_type='application/pdf'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))