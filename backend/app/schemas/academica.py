from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.models.enums import TandaTipo, ModalidadTipo

# Asignatura Schemas
class AsignaturaBase(BaseModel):
    codigo: str
    nombre: str
    abreviatura: Optional[str] = None
    es_activa: bool = True
    orden: int = 1

class AsignaturaCreate(AsignaturaBase):
    pass

class AsignaturaUpdate(AsignaturaBase):
    pass

class AsignaturaResponse(AsignaturaBase):
    id: int
    centro_id: int

    model_config = ConfigDict(from_attributes=True)

# Seccion Schemas
class SeccionBase(BaseModel):
    nombre: str
    tanda: TandaTipo
    capacidad_max: int = 35
    es_activa: bool = True
    grado_id: int

class SeccionCreate(SeccionBase):
    pass

class SeccionUpdate(SeccionBase):
    pass

class SeccionResponse(SeccionBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# Grado Schemas
class GradoBase(BaseModel):
    numero: int
    nombre: str
    nivel: str = 'SECUNDARIO'
    ciclo: int
    modalidad: ModalidadTipo
    anio_escolar_id: int

class GradoResponse(GradoBase):
    id: int
    secciones: List[SeccionResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Asignacion Docente Schemas
class AsignacionDocenteBase(BaseModel):
    docente_id: int
    asignatura_id: int
    seccion_id: int
    anio_escolar_id: int

class AsignacionDocenteCreate(AsignacionDocenteBase):
    pass

class AsignacionDocenteResponse(AsignacionDocenteBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
