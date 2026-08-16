from fastapi import APIRouter
from app.api.endpoints import auth, docentes, calificaciones, asignaturas, asignaciones, secciones, estudiantes, usuarios, institucional, competencias

api_router = APIRouter()
api_router.include_router(auth.router, tags=["login"])
api_router.include_router(docentes.router, prefix="/docentes", tags=["docentes"])
api_router.include_router(calificaciones.router, prefix="/calificaciones", tags=["calificaciones"])
api_router.include_router(asignaturas.router, prefix="/asignaturas", tags=["asignaturas"])
api_router.include_router(asignaciones.router, prefix="/asignaciones", tags=["asignaciones"])
api_router.include_router(secciones.router, prefix="/secciones", tags=["secciones"])
api_router.include_router(estudiantes.router, prefix="/estudiantes", tags=["estudiantes"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["usuarios"])
api_router.include_router(institucional.router, prefix="/institucional", tags=["institucional"])
api_router.include_router(competencias.router, prefix="/competencias", tags=["competencias"])
