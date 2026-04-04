import os
from copy import deepcopy

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

PROXY_API_KEY = os.getenv("PROXY_API_KEY", "").strip()
PORT = int(os.getenv("PORT", "8000"))

_cors_origins = os.getenv("CORS_ORIGINS", "*").strip()
if _cors_origins == "*":
    _cors_allow_all = True
    origins = ["*"]
else:
    _cors_allow_all = False
    origins = [o.strip() for o in _cors_origins.split(",") if o.strip()]

app = FastAPI(title="EduPlatform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=not _cors_allow_all,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


def _verify_api_key(request: Request) -> None:
    if not PROXY_API_KEY:
        return
    key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
    if not key or key != PROXY_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


# Шаблоны курсов: default_progress — начальный мок; можно переопределить второй ручкой
_MOCK_COURSE_TEMPLATES = [
    {
        "id": "intro-cs",
        "title": "Introduction to Computer Science",
        "short_description": "Algorithms, abstraction, data structures.",
        "description": "Broad introduction to programming and computational thinking using Python.",
        "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
        "organization": "EduPlatform Lab",
        "level": "beginner",
        "duration_weeks": 12,
        "default_progress": 12,
    },
    {
        "id": "web-frontend",
        "title": "Modern Web Frontend",
        "short_description": "HTML, CSS, JavaScript, components.",
        "description": "Build responsive interfaces and learn the component model step by step.",
        "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
        "organization": "EduPlatform Lab",
        "level": "beginner",
        "duration_weeks": 8,
        "default_progress": 45,
    },
    {
        "id": "data-structures",
        "title": "Data Structures in Practice",
        "short_description": "Lists, trees, graphs, hash tables.",
        "description": "Classic structures with complexity analysis and hands-on exercises.",
        "image_url": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
        "organization": "EduPlatform Lab",
        "level": "intermediate",
        "duration_weeks": 10,
        "default_progress": 0,
    },
    {
        "id": "ml-basics",
        "title": "Machine Learning Fundamentals",
        "short_description": "Supervised learning, evaluation, baselines.",
        "description": "From linear models to trees and simple neural nets with a focus on intuition.",
        "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
        "organization": "AI School",
        "level": "intermediate",
        "duration_weeks": 14,
        "default_progress": 67,
    },
    {
        "id": "sql-databases",
        "title": "SQL and Relational Databases",
        "short_description": "Queries, joins, normalization.",
        "description": "Design schemas, write efficient queries, and understand transactions.",
        "image_url": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
        "organization": "Data Guild",
        "level": "beginner",
        "duration_weeks": 6,
        "default_progress": 100,
    },
    {
        "id": "devops-ci",
        "title": "DevOps and CI/CD",
        "short_description": "Containers, pipelines, observability.",
        "description": "Ship software reliably with automated tests and deployment pipelines.",
        "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        "organization": "Cloud Works",
        "level": "advanced",
        "duration_weeks": 9,
        "default_progress": 23,
    },
    {
        "id": "ux-research",
        "title": "UX Research Methods",
        "short_description": "Interviews, usability tests, synthesis.",
        "description": "Plan studies, collect evidence, and turn insights into product decisions.",
        "image_url": "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80",
        "organization": "Design Studio",
        "level": "beginner",
        "duration_weeks": 5,
        "default_progress": 8,
    },
    {
        "id": "cybersec-101",
        "title": "Cybersecurity Essentials",
        "short_description": "Threat models, crypto basics, secure design.",
        "description": "Foundations for building and operating safer systems.",
        "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
        "organization": "SecOps",
        "level": "intermediate",
        "duration_weeks": 7,
        "default_progress": 55,
    },
    {
        "id": "python-pro",
        "title": "Python for Production",
        "short_description": "Packaging, typing, testing, performance.",
        "description": "Move from scripts to maintainable applications and libraries.",
        "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80",
        "organization": "EduPlatform Lab",
        "level": "advanced",
        "duration_weeks": 8,
        "default_progress": 33,
    },
    {
        "id": "project-management",
        "title": "Agile Project Management",
        "short_description": "Scrum, Kanban, delivery metrics.",
        "description": "Plan iterations, manage risk, and align teams around outcomes.",
        "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
        "organization": "Biz School",
        "level": "beginner",
        "duration_weeks": 4,
        "default_progress": 90,
    },
]

_progress_overrides: dict[str, int] = {}


def _course_ids() -> set[str]:
    return {c["id"] for c in _MOCK_COURSE_TEMPLATES}


def _public_course(row: dict) -> dict:
    cid = row["id"]
    default = int(row.get("default_progress", 0))
    progress = _progress_overrides.get(cid, default)
    out = {k: v for k, v in row.items() if k != "default_progress"}
    out["progress_percent"] = progress
    return out


class ProgressBody(BaseModel):
    progress_percent: int = Field(
        ge=0, le=100, description="Желаемый процент прохождения курса (0–100)"
    )


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/api/courses")
async def list_courses(request: Request):
    """10 моковых курсов: картинки, описание, уровень, длительность, процент прохождения."""
    _verify_api_key(request)
    courses = [_public_course(deepcopy(t)) for t in _MOCK_COURSE_TEMPLATES]
    return {"courses": courses, "count": len(courses)}


@app.patch("/api/courses/{course_id}/progress")
async def set_course_progress(course_id: str, body: ProgressBody, request: Request):
    """Задать желаемый процент прохождения для курса по id."""
    _verify_api_key(request)
    if course_id not in _course_ids():
        raise HTTPException(status_code=404, detail="Course not found")
    _progress_overrides[course_id] = body.progress_percent
    return {"id": course_id, "progress_percent": body.progress_percent}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
