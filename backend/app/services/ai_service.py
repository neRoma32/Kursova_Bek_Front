import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()


class AIService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("models/gemini-flash-latest")

    async def improve_style(self, text: str) -> str:
        prompt = (
            "Ти професійний мовний редактор.\n"
            "Завдання: покращ стилістику тексту, зроби його грамотним, природним і професійним.\n"
            "Вимоги:\n"
            "- не змінюй мову тексту\n"
            "- не змінюй сенс\n"
            "- не додавай нову інформацію\n"
            "- не додавай пояснень або коментарів\n"
            "Поверни лише відредагований текст без лапок.\n\n"
            f"Текст:\n{text}"
        )
        return await self._generate(prompt)

    async def translate(self, text: str, target_lang: str) -> str:
        prompt = (
            f"Ти професійний перекладач.\n"
            f"Завдання: переклади текст на мову: {target_lang}.\n"
            "Вимоги:\n"
            "- збережи сенс і стиль\n"
            "- не скорочуй і не розширюй текст\n"
            "- не додавай пояснень\n"
            "Поверни лише перекладений текст без лапок.\n\n"
            f"Текст:\n{text}"
        )
        return await self._generate(prompt)

    async def summarize(self, text: str, percentage: int = None) -> str:
        reduction = f"приблизно на {percentage}%" if percentage else "коротко і стисло"

        prompt = (
            "Ти професійний редактор.\n"
            f"Завдання: скороти текст {reduction}.\n"
            "Вимоги:\n"
            "- збережи основну думку\n"
            "- не змінюй мову\n"
            "- не додавай власних висновків\n"
            "- не додавай заголовків або списків\n"
            "Поверни лише скорочений текст.\n\n"
            f"Текст:\n{text}"
        )
        return await self._generate(prompt)

    async def expand(self, text: str, percentage: int = None) -> str:
        expansion = f"приблизно на {percentage}%" if percentage else "помірно"

        prompt = (
            "Ти професійний редактор.\n"
            f"Завдання: розшир текст {expansion}, зберігши стиль і мову.\n"
            "Вимоги:\n"
            "- не змінюй сенс\n"
            "- не повторюй одні й ті ж фрази\n"
            "- не додавай вигаданих фактів\n"
            "- не додавай пояснень\n"
            "Поверни лише розширений текст.\n\n"
            f"Текст:\n{text}"
        )
        return await self._generate(prompt)

    async def rewrite(self, text: str) -> str:
        prompt = (
            "Ти професійний редактор.\n"
            "Завдання: перепиши текст іншими словами.\n"
            "Вимоги:\n"
            "- збережи мову\n"
            "- збережи стиль (формальний / неформальний)\n"
            "- збережи сенс повністю\n"
            "- не скорочуй і не розширюй текст суттєво\n"
            "- не додавай пояснень\n"
            "Поверни лише переписаний текст.\n\n"
            f"Текст:\n{text}"
        )
        return await self._generate(prompt)

    async def generate_title(self, text: str) -> str:
        prompt = (
            "Ти професійний редактор заголовків.\n"
            "Завдання: створи короткий, влучний заголовок.\n"
            "Вимоги:\n"
            "- максимум 6 слів\n"
            "- та сама мова, що й у тексті\n"
            "- без лапок\n"
            "- без крапки в кінці\n"
            "- без загальних слів типу 'Текст про'\n"
            "Поверни лише заголовок.\n\n"
            f"Текст:\n{text[:1000]}"
        )
        return await self._generate(prompt)
    
    async def describe_text(self, text: str) -> str:
        prompt = (
            "Ти аналітик текстів.\n"
            "Завдання: коротко опиши, про що цей текст.\n"
            "Вимоги:\n"
            "- 2–3 речення\n"
            "- без деталей і прикладів\n"
            "- та сама мова, що і в тексті\n"
            "- без вступів типу 'Цей текст про'\n"
            "Поверни лише опис.\n\n"
            f"Текст:\n{text[:1500]}"
        )
        return await self._generate(prompt)


    async def _generate(self, prompt: str) -> str:
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            raise RuntimeError(f"AI error: {e}")


ai_service = AIService()
