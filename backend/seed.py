import os
import sys
from datetime import date
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models import (
    Regional, Distrito, CentroEducativo, AnioEscolar,
    PeriodoAcademico, Grado, Seccion, Asignatura, GradoAsignatura,
    Estudiante, EstudianteSeccion, Docente, AsignacionDocente,
    CompetenciaEspecifica, GrupoCompetencia, GrupoCompetenciaDetalle,
    TandaTipo, ModalidadTipo, EstadoPeriodoTipo, SexoTipo,
    CondicionInicialTipo, EstadoEstudianteTipo, SituacionFinalTipo,
    RolNombreTipo
)
from app.models.seguridad import Usuario, Rol, UsuarioRol
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    
    # 1. Institucional
    regional = db.query(Regional).first()
    if not regional:
        regional = Regional(codigo="10", nombre="Santo Domingo II")
        db.add(regional)
        db.flush()
        
    distrito = db.query(Distrito).first()
    if not distrito:
        distrito = Distrito(codigo="10-01", nombre="Villa Mella", regional_id=regional.id)
        db.add(distrito)
        db.flush()
        
    centro = db.query(CentroEducativo).first()
    if not centro:
        centro = CentroEducativo(
            codigo_minerd="01234", 
            nombre="Centro de Excelencia", 
            distrito_id=distrito.id,
            tanda_principal=TandaTipo.MATUTINA
        )
        db.add(centro)
        db.flush()
        
    anio = db.query(AnioEscolar).first()
    if not anio:
        anio = AnioEscolar(
            descripcion="2023-2024", 
            fecha_inicio=date(2023, 8, 20), 
            fecha_fin=date(2024, 6, 20),
            centro_id=centro.id,
            es_activo=True
        )
        db.add(anio)
        db.flush()
        
    periodo = db.query(PeriodoAcademico).first()
    if not periodo:
        periodo = PeriodoAcademico(
            numero=1, nombre="P1", anio_escolar_id=anio.id, 
            fecha_inicio=date(2023, 8, 20), fecha_fin=date(2023, 10, 20),
            estado=EstadoPeriodoTipo.ACTIVO
        )
        db.add(periodo)
        db.flush()

    # 2. Académico
    grado = db.query(Grado).first()
    if not grado:
        grado = Grado(
            anio_escolar_id=anio.id,
            numero=2,
            nombre="Segundo",
            ciclo=1,
            modalidad=ModalidadTipo.CIENCIAS_Y_HUMANIDADES
        )
        db.add(grado)
        db.flush()
        
    seccion = db.query(Seccion).first()
    if not seccion:
        seccion = Seccion(
            nombre="B", 
            grado_id=grado.id,
            tanda=TandaTipo.MATUTINA,
            capacidad_max=35
        )
        db.add(seccion)
        db.flush()
        
    asignatura = db.query(Asignatura).first()
    if not asignatura:
        asignatura = Asignatura(codigo="MAT-02", nombre="Matemática", centro_id=centro.id)
        db.add(asignatura)
        db.flush()

    # 3. Personas y Asignaciones
    docente = db.query(Docente).first()
    if not docente:
        docente = Docente(
            centro_id=centro.id,
            cedula="001-0000000-1",
            primer_nombre="Juan", 
            primer_apellido="Pérez", 
            correo="juan.perez@docente.edu.do",
            sexo=SexoTipo.M
        )
        db.add(docente)
        db.flush()
        
    # 4. Estudiantes (Generar 15 estudiantes)
    estudiantes = db.query(Estudiante).all()
    if len(estudiantes) < 15:
        nombres_estudiantes = [
            ("Ana", "García", SexoTipo.F), ("Carlos", "López", SexoTipo.M), 
            ("María", "Martínez", SexoTipo.F), ("José", "Rodríguez", SexoTipo.M), 
            ("Laura", "Hernández", SexoTipo.F), ("Pedro", "González", SexoTipo.M),
            ("Sofía", "Pérez", SexoTipo.F), ("Luis", "Sánchez", SexoTipo.M), 
            ("Carmen", "Ramírez", SexoTipo.F), ("Miguel", "Torres", SexoTipo.M), 
            ("Isabel", "Flores", SexoTipo.F), ("Jorge", "Rivera", SexoTipo.M),
            ("Marta", "Gómez", SexoTipo.F), ("Diego", "Díaz", SexoTipo.M), 
            ("Elena", "Reyes", SexoTipo.F)
        ]
        
        for i, (nombre, apellido, sexo) in enumerate(nombres_estudiantes, start=1):
            est = db.query(Estudiante).filter(Estudiante.rne == f"{nombre[0]}{apellido[0]}23{i:04d}").first()
            if not est:
                est = Estudiante(
                    centro_id=centro.id,
                    primer_nombre=nombre,
                    primer_apellido=apellido,
                    rne=f"{nombre[0]}{apellido[0]}23{i:04d}",
                    sexo=sexo,
                    fecha_nacimiento=date(2008, 1, i)
                )
                db.add(est)
                db.flush()
                
                est_sec = EstudianteSeccion(
                    estudiante_id=est.id,
                    seccion_id=seccion.id,
                    anio_escolar_id=anio.id,
                    numero_orden=i,
                    fecha_ingreso=date(2023, 8, 20)
                )
                db.add(est_sec)

    # 4.5. Asignar docente a la sección
    asignacion = db.query(AsignacionDocente).first()
    if not asignacion:
        asignacion = AsignacionDocente(
            docente_id=docente.id,
            seccion_id=seccion.id,
            asignatura_id=asignatura.id,
            anio_escolar_id=anio.id,
            es_activa=True
        )
        db.add(asignacion)
        db.flush()

    # 5. Roles y Usuarios
    for rol_enum in RolNombreTipo:
        rol_db = db.query(Rol).filter(Rol.nombre == rol_enum).first()
        if not rol_db:
            rol_db = Rol(nombre=rol_enum, descripcion=f"Rol {rol_enum.value}")
            db.add(rol_db)
    db.flush()

    admin = db.query(Usuario).filter(Usuario.correo == "admin@sigera.edu.do").first()
    if not admin:
        admin = Usuario(
            correo="admin@sigera.edu.do",
            hashed_password=get_password_hash("admin123"),
            nombre_completo="Administrador del Sistema",
            es_superusuario=True
        )
        db.add(admin)
        db.flush()

    user_docente = db.query(Usuario).filter(Usuario.correo == "juan.perez@docente.edu.do").first()
    if not user_docente:
        user_docente = Usuario(
            correo="juan.perez@docente.edu.do",
            hashed_password=get_password_hash("docente123"),
            nombre_completo="Juan Pérez",
            es_superusuario=False
        )
        db.add(user_docente)
        db.flush()
        
        rol_doc = db.query(Rol).filter(Rol.nombre == RolNombreTipo.DOCENTE).first()
        if rol_doc:
            db_ur = UsuarioRol(
                usuario_id=user_docente.id,
                rol_id=rol_doc.id,
                centro_id=centro.id
            )
            db.add(db_ur)

    db.commit()
    print("Base de datos inicializada con éxito!")
    db.close()

if __name__ == "__main__":
    seed_db()
