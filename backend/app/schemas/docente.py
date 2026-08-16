from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from pydantic import EmailStr
from app.models.enums import SexoTipo

class AsignaturaBase(BaseModel):
    id: int
    codigo: str
    nombre: str
    model_config = ConfigDict(from_attributes=True)

class GradoBase(BaseModel):
    id: int
    numero: int
    nombre: str
    model_config = ConfigDict(from_attributes=True)

class SeccionBase(BaseModel):
    id: int
    nombre: str
    grado: GradoBase
    model_config = ConfigDict(from_attributes=True)

class AsignacionDocenteResponse(BaseModel):
    id: int
    seccion_id: int
    asignatura_id: int
    anio_escolar_id: int
    es_activa: bool
    creado_en: datetime
    
    seccion: SeccionBase
    asignatura: AsignaturaBase
    
    model_config = ConfigDict(from_attributes=True)

class DocenteBase(BaseModel):
    cedula: str
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    sexo: SexoTipo
    correo: EmailStr
    telefono: Optional[str] = None
    titulo_academico: Optional[str] = None
    especialidad: Optional[str] = None

class DocenteCreate(DocenteBase):
    centro_id: int

class DocenteUpdate(DocenteBase):
    pass

class DocenteResponse(DocenteBase):
    id: int
    centro_id: int
    es_activo: bool
    creado_en: datetime
    
    model_config = ConfigDict(from_attributes=True)
