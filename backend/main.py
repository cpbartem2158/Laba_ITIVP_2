import os
from urllib.parse import urljoin

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

load_dotenv()

EDX_UPSTREAM = os.getenv("EDX_UPSTREAM", "https://courses.edx.org").rstrip("/")
PROXY_API_KEY = os.getenv("PROXY_API_KEY", "").strip()
PORT = int(os.getenv("PORT", "8000"))

_cors_origins = os.getenv("CORS_ORIGINS", "*").strip()
if _cors_origins == "*":
    _cors_allow_all = True
    origins = ["*"]
else:
    _cors_allow_all = False
    origins = [o.strip() for o in _cors_origins.split(",") if o.strip()]

app = FastAPI(title="EduPlatform edX proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=not _cors_allow_all,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


def _verify_api_key(request: Request) -> None:
    if not PROXY_API_KEY:
        return
    key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
    if not key or key != PROXY_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


@app.get("/health")
async def health():
    return {"ok": True, "upstream": EDX_UPSTREAM}


@app.get("/api/edx/{path:path}")
async def proxy_edx(path: str, request: Request):
    _verify_api_key(request)
    path = path.lstrip("/")
    target = urljoin(EDX_UPSTREAM + "/", path)
    q = request.url.query
    if q:
        target = f"{target}?{q}"

    async with httpx.AsyncClient(follow_redirects=True, timeout=60.0) as client:
        r = await client.get(
            target,
            headers={
                "Accept": "application/json",
                "User-Agent": "EduPlatform-edx-proxy/1.0",
            },
        )

    content_type = r.headers.get("content-type", "application/json")
    return Response(content=r.content, status_code=r.status_code, media_type=content_type)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
