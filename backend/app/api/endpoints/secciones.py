from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Seccion, Grado
from app.schemas.academica import SeccionCreate, SeccionUpdate, SeccionResponse, GradoBase, GradoResponse
from app.api.deps import get_current_user, get_current_active_centro
from app.db.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------
# GRADOS
# -----------------

@router.get("/grados", response_model=List[GradoResponse])
def listar_grados(
    anio_escolar_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Grado)
    if anio_escolar_id is not None:
        query = query.filter(Grado.anio_escolar_id == anio_escolar_id)
    grados = query.order_by(Grado.numero).all()
    return grados

@router.post("/grados", response_model=GradoResponse, status_code=status.HTTP_201_CREATED)
def crear_grado(
    grado_in: GradoBase,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    try:
        # Check exists
        existente = db.query(Grado).filter(
            Grado.numero == grado_in.numero, 
            Grado.anio_escolar_id == grado_in.anio_escolar_id
        ).first()
        if existente:
            raise HTTPException(status_code=400, detail="Ya existe este grado en este año escolar.")
            
        db_obj = Grado(**grado_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error DB: {str(e)}")

from app.models import GrupoCompetencia, GradoAsignatura

@router.delete("/grados/{grado_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_grado(
    grado_id: int,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    db_obj = db.query(Grado).filter(Grado.id == grado_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Grado no encontrado")
        
    if db_obj.secciones:
        raise HTTPException(status_code=400, detail="No se puede eliminar el grado porque tiene secciones asociadas.")
        
    try:
        # Forzar la eliminación de dependencias huérfanas (grupos de competencia y asignaciones)
        db.query(GrupoCompetencia).filter(GrupoCompetencia.grado_id == grado_id).delete()
        db.query(GradoAsignatura).filter(GradoAsignatura.grado_id == grado_id).delete()
        
        db.delete(db_obj)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"No se puede eliminar el grado: {str(e)}")

# -----------------
# SECCIONES
# -----------------
@router.get("/", response_model=List[SeccionResponse])
def listar_secciones(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Devuelve todas las secciones activas ordenadas por grado
    return db.query(Seccion).join(Grado).order_by(Grado.numero, Seccion.nombre).all()

@router.get("/grado/{grado_id}", response_model=List[SeccionResponse])
def listar_secciones_por_grado(
    grado_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Seccion).filter(Seccion.grado_id == grado_id).order_by(Seccion.nombre).all()

@router.post("/", response_model=SeccionResponse, status_code=status.HTTP_201_CREATED)
def crear_seccion(
    seccion_in: SeccionCreate,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    existente = db.query(Seccion).filter(
        Seccion.nombre == seccion_in.nombre, 
        Seccion.grado_id == seccion_in.grado_id
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe esta sección en este grado.")
        
    db_obj = Seccion(**seccion_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{seccion_id}", response_model=SeccionResponse)
def actualizar_seccion(
    seccion_id: int,
    seccion_in: SeccionUpdate,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    db_obj = db.query(Seccion).filter(Seccion.id == seccion_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Sección no encontrada")
        
    for field, value in seccion_in.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
        
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/{seccion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_seccion(
    seccion_id: int,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    db_obj = db.query(Seccion).filter(Seccion.id == seccion_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Sección no encontrada")
        
    # TODO: Validar que no tenga estudiantes inscritos
    db.delete(db_obj)
    db.commit()
