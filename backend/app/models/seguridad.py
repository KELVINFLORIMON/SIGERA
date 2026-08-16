from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from app.db.base_class import Base
from app.models.enums import RolNombreTipo

class Usuario(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    correo = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    nombre_completo = Column(String(200), nullable=False)
    es_activo = Column(Boolean, default=True, nullable=False)
    es_superusuario = Column(Boolean, default=False, nullable=False)
    ultimo_acceso = Column(DateTime(timezone=True))
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class Rol(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(Enum(RolNombreTipo), unique=True, nullable=False)
    descripcion = Column(String(200))
    es_activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class UsuarioRol(Base):
    __tablename__ = "usuario_rol"
    
    id = Column(BigInteger, primary_key=True, index=True)
    usuario_id = Column(BigInteger, ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False)
    rol_id = Column(BigInteger, ForeignKey("rol.id", ondelete="CASCADE"), nullable=False)
    centro_id = Column(BigInteger, ForeignKey("centro_educativo.id", ondelete="CASCADE")) # Nulo = alcance global
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Permiso(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    recurso = Column(String(100), nullable=False) # ej: "estudiante"
    accion = Column(String(50), nullable=False) # ej: "crear", "leer", "actualizar", "eliminar"
    descripcion = Column(String(200))
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class RolPermiso(Base):
    __tablename__ = "rol_permiso"
    
    id = Column(BigInteger, primary_key=True, index=True)
    rol_id = Column(BigInteger, ForeignKey("rol.id", ondelete="CASCADE"), nullable=False)
    permiso_id = Column(BigInteger, ForeignKey("permiso.id", ondelete="CASCADE"), nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class AuditoriaCalificacion(Base):
    __tablename__ = "auditoria_calificacion"
    
    id = Column(BigInteger, primary_key=True, index=True)
    calificacion_asignatura_id = Column(BigInteger, ForeignKey("calificacion_asignatura.id", ondelete="RESTRICT"), nullable=False)
    usuario_id = Column(BigInteger, ForeignKey("usuario.id", ondelete="RESTRICT"), nullable=False)
    campo_modificado = Column(String(50), nullable=False)
    valor_anterior = Column(String(100))
    valor_nuevo = Column(String(100))
    justificacion = Column(Text, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip_origen = Column(String(45))
