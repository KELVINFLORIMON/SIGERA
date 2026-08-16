from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models import AsignacionDocente, Asignatura, Usuario, Seccion
from app.models.personas import Docente
from app.schemas.academica import AsignacionDocenteCreate, AsignacionDocenteResponse
from app.api.deps import get_current_user, get_current_active_centro
from pydantic import BaseModel
from app.db.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AsignacionDetalle(BaseModel):
    id: int
    docente_id: int
    docente_nombre: str
    asignatura_id: int
    asignatura_nombre: str
    seccion_id: int
    seccion_nombre: str

@router.get("/seccion/{seccion_id}", response_model=List[AsignacionDetalle])
def listar_asignaciones_por_seccion(
    seccion_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    asignaciones = db.query(AsignacionDocente).filter(AsignacionDocente.seccion_id == seccion_id).all()
    resultado = []
    for a in asignaciones:
        docente = db.query(Docente).filter(Docente.id == a.docente_id).first()
        asignatura = db.query(Asignatura).filter(Asignatura.id == a.asignatura_id).first()
        seccion = db.query(Seccion).filter(Seccion.id == a.seccion_id).first()
        
        resultado.append(AsignacionDetalle(
            id=a.id,
            docente_id=a.docente_id,
            docente_nombre=f"{docente.primer_nombre} {docente.primer_apellido}" if docente else "Desconocido",
            asignatura_id=a.asignatura_id,
            asignatura_nombre=asignatura.nombre if asignatura else "Desconocida",
            seccion_id=a.seccion_id,
            seccion_nombre=seccion.nombre if seccion else "Desconocida"
        ))
    return resultado

@router.post("/", response_model=AsignacionDocenteResponse, status_code=status.HTTP_201_CREATED)
def crear_asignacion(
    asignacion_in: AsignacionDocenteCreate,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    # Verificar que no exista otra asignación para la misma asignatura en la misma sección
    existente = db.query(AsignacionDocente).filter(
        AsignacionDocente.seccion_id == asignacion_in.seccion_id,
        AsignacionDocente.asignatura_id == asignacion_in.asignatura_id
    ).first()
    
    if existente:
        # Si ya existe, simplemente la actualizamos con el nuevo docente
        existente.docente_id = asignacion_in.docente_id
        db.commit()
        db.refresh(existente)
        return existente
        
    db_obj = AsignacionDocente(**asignacion_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/{asignacion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_asignacion(
    asignacion_id: int,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    db_obj = db.query(AsignacionDocente).filter(AsignacionDocente.id == asignacion_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
        
    db.delete(db_obj)
    db.commit()

@router.get("/docente/{docente_id}", response_model=List[AsignacionDetalle])
def listar_asignaciones_por_docente(
    docente_id: int,
    anio_escolar_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(AsignacionDocente).filter(AsignacionDocente.docente_id == docente_id)
    if anio_escolar_id:
        query = query.filter(AsignacionDocente.anio_escolar_id == anio_escolar_id)
    asignaciones = query.all()
    resultado = []
    for a in asignaciones:
        docente = db.query(Docente).filter(Docente.id == a.docente_id).first()
        asignatura = db.query(Asignatura).filter(Asignatura.id == a.asignatura_id).first()
        seccion = db.query(Seccion).filter(Seccion.id == a.seccion_id).first()
        resultado.append(AsignacionDetalle(
            id=a.id,
            docente_id=a.docente_id,
            docente_nombre=f"{docente.primer_nombre} {docente.primer_apellido}" if docente else "Desconocido",
            asignatura_id=a.asignatura_id,
            asignatura_nombre=asignatura.nombre if asignatura else "Desconocida",
            seccion_id=a.seccion_id,
            seccion_nombre=seccion.nombre if seccion else "Desconocida"
        ))
    return resultado
