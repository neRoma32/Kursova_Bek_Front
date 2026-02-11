import language_tool_python
from typing import Tuple, List

from app.schemas.text import Mistake


class SpellCheckService:
    def __init__(self):
        self._tool = language_tool_python.LanguageTool('uk-UA')

    def get_detailed_stats(self, text: str) -> Tuple[str, List[Mistake]]:
        matches = self._tool.check(text)
        corrected_text = self._tool.correct(text)

        mistakes: List[Mistake] = []

        for match in matches:
            mistakes.append(
                Mistake(
                    message=match.message,
                    suggestions=match.replacements[:5],
                    offset=match.offset,
                    length=match.error_length
                )
            )

        return corrected_text, mistakes


spell_service = SpellCheckService()
