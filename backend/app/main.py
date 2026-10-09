from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import time
import uuid
import os

from app.core.config import settings
from app.db.session import init_db, AsyncSessionLocal
from app.services.synthetic_seed import seed_synthetic_data, generate_sample_pdf_files
from app.api.v1.api_router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_synthetic_data(session)
    generate_sample_pdf_files()
    yield
    # Shutdown sequence

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-grade FastAPI backend for an Agentic Hospital Discharge & Follow-up Coordinator. "
        "Extracts, coordinates, tracks, and simplifies post-discharge instructions from synthetic PDFs "
        "while enforcing strict clinical boundaries and provenance traceability."
    ),
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request-ID Middleware
@app.middleware("http")
async def add_request_id_header(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    return response

# Include API Router under /api
app.include_router(api_router, prefix=settings.API_PREFIX)

# Include static files if directory exists
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": time.time(),
        "disclaimer": settings.SAFETY_DISCLAIMER
    }

@app.get("/", response_class=HTMLResponse, tags=["Web UI"])
async def serve_root():
    html_file = os.path.join(os.path.dirname(__file__), "static", "index.html")
    if os.path.exists(html_file):
        with open(html_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(
        content=f"<h1>{settings.PROJECT_NAME}</h1><p>Visit <a href='/docs'>/docs</a> for the API specification.</p>"
    )
