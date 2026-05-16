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
            category = "Лексика"
            issue_type = getattr(match, 'rule_issue_type', '').lower()
            lt_category = getattr(match, 'category', '').lower()
            
            if 'misspelling' in issue_type or 'орфографія' in lt_category or 'spelling' in lt_category:
                category = "Орфографія"
            elif 'typographical' in issue_type or 'punctuation' in lt_category or 'пунктуація' in lt_category:
                category = "Пунктуація"
            elif 'grammar' in issue_type or 'граматика' in lt_category:
                category = "Граматика"
            elif 'style' in issue_type or 'стилістика' in lt_category:
                category = "Стилістика"
            elif 'duplication' in issue_type or 'повтор' in lt_category:
                category = "Повтори слів"

            mistakes.append(
                Mistake(
                    message=match.message,
                    suggestions=match.replacements[:5],
                    offset=match.offset,
                    length=match.error_length,
                    category=category
                )
            )

        return corrected_text, mistakes


spell_service = SpellCheckService()