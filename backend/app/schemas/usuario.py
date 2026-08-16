from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from app.models.enums import SexoTipo, RolNombreTipo

class UsuarioBase(BaseModel):
    correo: EmailStr
    nombre_completo: str
    es_activo: Optional[bool] = True
    es_superusuario: bool = False

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(UsuarioBase):
    password: Optional[str] = None

from pydantic import ConfigDict

class UsuarioInDBBase(UsuarioBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Usuario(UsuarioInDBBase):
    pass

class UsuarioLoginResponse(Usuario):
    roles: List[str] = []
    centro_id: Optional[int] = None
    centro_nombre: Optional[str] = None

class UsuarioInDB(UsuarioInDBBase):
    hashed_password: str

class UsuarioCreacionUnificada(BaseModel):
    rol_nombre: RolNombreTipo
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
    centro_id: Optional[int] = None # Puede venir null si el backend debe inyectarlo
    
class UsuarioResponseUnificada(BaseModel):
    id: int
    correo: str
    nombre_completo: str
    es_activo: bool
    roles: List[str] # Lista de nombres de rol (ej: ["ADMINISTRADOR"])
    docente_id: Optional[int] = None # Si se creó su registro docente, devolver el ID
    cedula: Optional[str] = None
    telefono: Optional[str] = None
    especialidad: Optional[str] = None
    centro_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
