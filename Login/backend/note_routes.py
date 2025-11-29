# note_routes.py
import os
import requests
import urllib.parse
from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from .dependencies import get_current_user
from .models import User

router = APIRouter(prefix="/notes", tags=["notes"])

# Media folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

ALLOWED_PREFIXES = ("image/", "audio/", "video/")


@router.post("/upload")
async def upload_note_file(
    file: UploadFile = File(...), user: User = Depends(get_current_user)
):
    """Receive any media file and store it."""
    if not file.content_type.startswith(ALLOWED_PREFIXES):
        raise HTTPException(
            status_code=400, detail=f"Unsupported file type: {file.content_type}"
        )

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid4().hex}{ext}"
    filepath = os.path.join(MEDIA_DIR, filename)
    print("🟦 Saving file to:", filepath)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    url = f"/media/{filename}"
    print("🟩 Returning URL:", url)  # AND THIS ONE
    return JSONResponse({"url": url})
