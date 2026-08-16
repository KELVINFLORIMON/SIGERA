from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.models.seguridad import Usuario
from app.models.personas import Docente, AsignacionDocente
from app.models.academica import Seccion
from app.schemas.docente import AsignacionDocenteResponse

router = APIRouter()

@router.get("/me/asignaciones", response_model=List[AsignacionDocenteResponse])
def get_mis_asignaciones(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    """
    Obtener las asignaciones del docente logueado.
    Busca al docente por el correo del usuario actual.
    """
    # 1. Buscar al docente por el correo
    docente = db.query(Docente).filter(Docente.correo == current_user.correo).first()
    
    if not docente:
        raise HTTPException(status_code=404, detail="El usuario no tiene un perfil de docente asociado.")
        
    # 2. Buscar sus asignaciones activas
    asignaciones = (
        db.query(AsignacionDocente)
        .options(
            joinedload(AsignacionDocente.seccion),
            joinedload(AsignacionDocente.asignatura)
        )
        .filter(
            AsignacionDocente.docente_id == docente.id,
            AsignacionDocente.es_activa == True
        )
        .all()
    )
    
    return asignaciones
