from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey, Date, Enum, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from app.models.enums import TandaTipo, ModalidadTipo, EstadoAnioTipo

class Regional(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    codigo = Column(String(10), unique=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    es_activa = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    distritos = relationship("Distrito", back_populates="regional")

class Distrito(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    regional_id = Column(BigInteger, ForeignKey("regional.id", ondelete="RESTRICT"), nullable=False)
    codigo = Column(String(10), unique=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    es_activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    regional = relationship("Regional", back_populates="distritos")
    centros = relationship("CentroEducativo", back_populates="distrito")

class CentroEducativo(Base):
    __tablename__ = "centro_educativo"
    
    id = Column(BigInteger, primary_key=True, index=True)
    distrito_id = Column(BigInteger, ForeignKey("distrito.id", ondelete="RESTRICT"), nullable=False)
    codigo_minerd = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    direccion = Column(String)
    telefono = Column(String(20))
    correo = Column(String(150))
    tanda_principal = Column(Enum(TandaTipo))
    modalidad = Column(Enum(ModalidadTipo))
    es_activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    distrito = relationship("Distrito", back_populates="centros")
    anios_escolares = relationship("AnioEscolar", back_populates="centro")

class AnioEscolar(Base):
    __tablename__ = "anio_escolar"
    
    id = Column(BigInteger, primary_key=True, index=True)
    centro_id = Column(BigInteger, ForeignKey("centro_educativo.id", ondelete="RESTRICT"), nullable=False)
    descripcion = Column(String(20), nullable=False) # ej: "2025-2026"
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    estado = Column(Enum(EstadoAnioTipo), default=EstadoAnioTipo.CONFIGURACION, nullable=False)
    es_activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    creado_por = Column(BigInteger) # FK a usuario (se agregará despues si es necesario o manejado por logic)
    
    # Relationships
    centro = relationship("CentroEducativo", back_populates="anios_escolares")
    periodos = relationship("app.models.academica.PeriodoAcademico")
    
    __table_args__ = (
        UniqueConstraint('centro_id', 'descripcion', name='uq_anio_centro'),
        CheckConstraint('fecha_fin > fecha_inicio', name='chk_fechas_anio'),
    )
