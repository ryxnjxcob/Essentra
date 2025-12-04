import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from zhipuai import ZhipuAI

# Load your API key from .env
load_dotenv()

router = APIRouter()


class TranslationRequest(BaseModel):
    text: str
    target: str  # "kn" or "ml"


class SummarizeRequest(BaseModel):
    text: str


@router.post("/summarize")
async def summarize(req: SummarizeRequest):
    try:
        api_key = os.getenv("ZHIPU_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ZHIPU_API_KEY not configured")

        client = ZhipuAI(api_key=api_key)

        # GLM call (ChatGLM 4.5 Air)
        response = client.chat.completions.create(
            model="glm-4-0520",  # or "glm-4-air" if that's your endpoint
            messages=[
                {"role": "system", "content": "You are a helpful note summarizer."},
                {"role": "user", "content": f"Summarize this text:\n{req.text}"},
            ],
        )

        summary = response.choices[0].message.content.strip()
        return {"summary": summary}

    except Exception as e:
        print("Summarization error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate summary")


@router.post("/translate")
async def translate(req: TranslationRequest):
    try:
        client = ZhipuAI(api_key=os.getenv("ZHIPU_API_KEY"))

        lang_map = {"kn": "Kannada", "ml": "Malayalam"}
        target_lang = lang_map.get(req.target)

        if not target_lang:
            raise HTTPException(400, "Invalid target language")

        for attempt in range(3):  # 🔥 auto retry 3 times
            try:
                response = client.chat.completions.create(
                    model="glm-4-0520",
                    messages=[
                        {"role": "system", "content": "You are a translation AI."},
                        {
                            "role": "user",
                            "content": f"Translate into {target_lang}:\n{req.text}",
                        },
                    ],
                    temperature=0.4,  # more accuracy for translation
                    timeout=20,  # prevents long hangs
                )

                result = response.choices[0].message.content.strip()
                return {"translated": result}  # SUCCESS RETURN

            except Exception:
                if attempt == 2:
                    raise  # final failure → throw error
                print("Retrying translation...")

    except Exception as e:
        print("Translation failed:", e)
        raise HTTPException(500, "AI Translation Failed")
