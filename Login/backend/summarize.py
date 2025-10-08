from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from zhipuai import ZhipuAI
import os
from dotenv import load_dotenv

# Load your API key from .env
load_dotenv()

router = APIRouter()


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
