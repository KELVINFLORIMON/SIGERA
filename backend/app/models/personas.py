from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey, Date, Enum, SmallInteger, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from app.models.enums import SexoTipo, CondicionInicialTipo, EstadoEstudianteTipo, SituacionFinalTipo, TipoRepresentanteTipo

class Estudiante(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    centro_id = Column(BigInteger, ForeignKey("centro_educativo.id", ondelete="RESTRICT"), nullable=True)
    rne = Column(String(20), nullable=False)
    cedula = Column(String(20))
    libro_acta = Column(String(10))
    folio_acta = Column(String(10))
    anio_acta = Column(SmallInteger)
    primer_nombre = Column(String(80), nullable=False)
    segundo_nombre = Column(String(80))
    primer_apellido = Column(String(80), nullable=False)
    segundo_apellido = Column(String(80))
    sexo = Column(Enum(SexoTipo), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    lugar_nacimiento = Column(String(100))
    direccion = Column(Text)
    telefono = Column(String(20))
    correo = Column(String(150))
    foto_url = Column(Text)
    tiene_condicion_medica = Column(Boolean, default=False, nullable=False)
    condicion_medica = Column(Text)
    es_activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    creado_por = Column(BigInteger)
    
    __table_args__ = (
        UniqueConstraint('rne', 'centro_id', name='uq_estudiante_rne_centro'),
    )

    secciones = relationship("EstudianteSeccion", back_populates="estudiante")
    representantes = relationship("Representante", backref="estudiante", cascade="all, delete-orphan")

class EstudianteSeccion(Base):
    __tablename__ = "estudiante_seccion"
    
    id = Column(BigInteger, primary_key=True, index=True)
    estudiante_id = Column(BigInteger, ForeignKey("estudiante.id", ondelete="RESTRICT"), nullable=False)
    seccion_id = Column(BigInteger, ForeignKey("seccion.id", ondelete="RESTRICT"), nullable=False)
    anio_escolar_id = Column(BigInteger, ForeignKey("anio_escolar.id", ondelete="RESTRICT"), nullable=False)
    numero_orden = Column(SmallInteger, nullable=False)
    condicion_inicial = Column(Enum(CondicionInicialTipo), default=CondicionInicialTipo.PROMOVIDO, nullable=False)
    estado = Column(Enum(EstadoEstudianteTipo), default=EstadoEstudianteTipo.ACTIVO, nullable=False)
    fecha_ingreso = Column(Date, nullable=False)
    fecha_retiro = Column(Date)
    motivo_retiro = Column(Text)
    centro_destino = Column(String(200))
    situacion_final = Column(Enum(SituacionFinalTipo), default=SituacionFinalTipo.PENDIENTE)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('estudiante_id', 'anio_escolar_id', name='uq_estudiante_anio'),
    )

    estudiante = relationship("Estudiante", back_populates="secciones")

class Representante(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    estudiante_id = Column(BigInteger, ForeignKey("estudiante.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(Enum(TipoRepresentanteTipo), nullable=False)
    nombre_completo = Column(String(200), nullable=False)
    cedula = Column(String(20))
    telefono_1 = Column(String(20))
    telefono_2 = Column(String(20))
    correo = Column(String(150))
    es_contacto_emergencia = Column(Boolean, default=False, nullable=False)
    es_activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class Docente(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    centro_id = Column(BigInteger, ForeignKey("centro_educativo.id", ondelete="RESTRICT"), nullable=False)
    cedula = Column(String(20), unique=True, nullable=False)
    primer_nombre = Column(String(80), nullable=False)
    segundo_nombre = Column(String(80))
    primer_apellido = Column(String(80), nullable=False)
    segundo_apellido = Column(String(80))
    sexo = Column(Enum(SexoTipo))
    correo = Column(String(150), unique=True, nullable=False)
    telefono = Column(String(20))
    titulo_academico = Column(String(150))
    especialidad = Column(String(150))
    es_activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class AsignacionDocente(Base):
    __tablename__ = "asignacion_docente"
    
    id = Column(BigInteger, primary_key=True, index=True)
    docente_id = Column(BigInteger, ForeignKey("docente.id", ondelete="RESTRICT"), nullable=False)
    seccion_id = Column(BigInteger, ForeignKey("seccion.id", ondelete="RESTRICT"), nullable=False)
    asignatura_id = Column(BigInteger, ForeignKey("asignatura.id", ondelete="RESTRICT"), nullable=False)
    anio_escolar_id = Column(BigInteger, ForeignKey("anio_escolar.id", ondelete="RESTRICT"), nullable=False)
    es_activa = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    seccion = relationship("app.models.academica.Seccion")
    asignatura = relationship("app.models.academica.Asignatura")
    
    __table_args__ = (
        UniqueConstraint('seccion_id', 'asignatura_id', 'anio_escolar_id', name='uq_asignacion'),
    )
