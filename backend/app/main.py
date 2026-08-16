from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
import traceback
from app.api.api import api_router
from sqlalchemy.orm import Session
from app.db.session import SessionLocal

global_errors = []

app = FastAPI(
    title="SIGERA API",
    description="API del Sistema Inteligente de Gestión Educativa y Rendimiento Académico",
    version="1.0.0"
)

# Configuración básica de CORS para permitir solicitudes desde el frontend (React/Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175", "http://localhost:3000"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+|https://.*\.vercel\.app|https://.*\.azurewebsites\.net",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    global_errors.append(f"Unhandled Exception: {exc}\n{traceback.format_exc()}")
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    global_errors.append(f"Validation Error: {exc}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

@app.get("/")
def read_root():
    return {"message": "¡Bienvenido a la API de SIGERA!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/logs")
def get_logs():
    return {"logs": global_errors}

@app.get("/seed")
def seed_database():
    try:
        import seed
        seed.seed_db()
        return {"status": "success", "message": "Base de datos poblada correctamente"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
