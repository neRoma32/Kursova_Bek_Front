from pydantic import BaseModel, Field
from typing import Optional, List

class Mistake(BaseModel):
    message: str
    suggestions: List[str]
    offset: int
    length: int

class SpellCheckResult(BaseModel):
    corrected: str
    style_improved: str
    mistakes: List[Mistake]

class DetailedSpellCheckResponse(BaseModel):
    original_text: str
    result: SpellCheckResult
    action: str = "check"
    char_count: int
    word_count: int

class TextResponse(BaseModel):
    original_text: str
    processed_text: str
    action: str
    char_count: int
    word_count: int
    error_count: int = 0

class TranslateRequest(BaseModel):
    text: str
    target_language: str

class ModifyRequest(BaseModel):
    text: str
    percentage: Optional[int] = None

class RewriteRequest(BaseModel):
    text: str

class SpellCheckRequest(BaseModel):
    text: str

class TextRequest(BaseModel):
    text: str
    custom_title: Optional[str] = Field(None, description="Власний заголовок. Якщо пусте - придумає AI.")

class FileAnalysisResponse(BaseModel):
    filename: str
    char_count: int
    word_count: int
    summary: str
    spellcheck: SpellCheckResult
