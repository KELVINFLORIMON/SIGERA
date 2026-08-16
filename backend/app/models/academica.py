from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey, Date, Enum, SmallInteger, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from app.models.enums import EstadoPeriodoTipo, ModalidadTipo, TandaTipo

class PeriodoAcademico(Base):
    __tablename__ = "periodo_academico"
    
    id = Column(BigInteger, primary_key=True, index=True)
    anio_escolar_id = Column(BigInteger, ForeignKey("anio_escolar.id", ondelete="RESTRICT"), nullable=False)
    numero = Column(SmallInteger, nullable=False)
    nombre = Column(String(30), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    estado = Column(Enum(EstadoPeriodoTipo), default=EstadoPeriodoTipo.PENDIENTE, nullable=False)
    cerrado_en = Column(DateTime(timezone=True))
    cerrado_por = Column(BigInteger)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('anio_escolar_id', 'numero', name='uq_periodo_anio'),
        CheckConstraint('numero BETWEEN 1 AND 4', name='chk_numero_periodo'),
        CheckConstraint('fecha_fin > fecha_inicio', name='chk_fechas_periodo'),
    )

class Grado(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    anio_escolar_id = Column(BigInteger, ForeignKey("anio_escolar.id", ondelete="RESTRICT"), nullable=False)
    numero = Column(SmallInteger, nullable=False)
    nombre = Column(String(50), nullable=False)
    nivel = Column(String(50), default='SECUNDARIO', nullable=False)
    ciclo = Column(SmallInteger, nullable=False)
    modalidad = Column(Enum(ModalidadTipo), default=ModalidadTipo.CIENCIAS_Y_HUMANIDADES, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    secciones = relationship("Seccion", back_populates="grado")
    
    __table_args__ = (
        UniqueConstraint('anio_escolar_id', 'numero', 'modalidad', name='uq_grado_anio'),
        CheckConstraint('numero BETWEEN 1 AND 6', name='chk_numero_grado'),
        CheckConstraint('ciclo IN (1, 2)', name='chk_ciclo_grado'),
    )

class Seccion(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    grado_id = Column(BigInteger, ForeignKey("grado.id", ondelete="RESTRICT"), nullable=False)
    nombre = Column(String(10), nullable=False)
    tanda = Column(Enum(TandaTipo), nullable=False)
    capacidad_max = Column(SmallInteger, default=35, nullable=False)
    es_activa = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    grado = relationship("Grado", back_populates="secciones")

class Asignatura(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    centro_id = Column(BigInteger, ForeignKey("centro_educativo.id", ondelete="RESTRICT"), nullable=False)
    codigo = Column(String(10), nullable=False)
    nombre = Column(String(100), nullable=False)
    abreviatura = Column(String(20))
    es_activa = Column(Boolean, default=True, nullable=False)
    orden = Column(SmallInteger, default=1, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint('centro_id', 'codigo', name='uq_asignatura_centro'),
    )

class GradoAsignatura(Base):
    __tablename__ = "grado_asignatura"
    
    id = Column(BigInteger, primary_key=True, index=True)
    grado_id = Column(BigInteger, ForeignKey("grado.id", ondelete="RESTRICT"), nullable=False)
    asignatura_id = Column(BigInteger, ForeignKey("asignatura.id", ondelete="RESTRICT"), nullable=False)
    creditos = Column(SmallInteger)
    horas_semana = Column(SmallInteger)
    es_activa = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('grado_id', 'asignatura_id', name='uq_grado_asig'),
    )
