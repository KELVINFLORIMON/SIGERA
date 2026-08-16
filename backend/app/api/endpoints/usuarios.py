from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.seguridad import Usuario, Rol, UsuarioRol
from app.models.personas import Docente
from app.schemas.usuario import UsuarioCreacionUnificada, UsuarioResponseUnificada
from app.core.security import get_password_hash
from app.models.enums import RolNombreTipo

router = APIRouter()

def generar_password_defecto(nombre: str, apellido: str, cedula: str) -> str:
    """
    Genera contraseña: 
    Inicial Primer Nombre (mayúscula) + Inicial Primer Apellido (minúscula) + Últimos 6 dígitos de Cédula.
    Ej: Juan Pérez, 001-0012345-6 -> Jp123456
    """
    n = nombre[0].upper() if nombre else "X"
    a = apellido[0].lower() if apellido else "x"
    # Limpiar cédula (quitar guiones)
    ced_limpia = cedula.replace("-", "").replace(" ", "")
    ultimos_6 = ced_limpia[-6:] if len(ced_limpia) >= 6 else ced_limpia.zfill(6)
    return f"{n}{a}{ultimos_6}"

@router.get("/", response_model=List[UsuarioResponseUnificada])
def get_usuarios_centro(
    db: Session = Depends(deps.get_db),
    centro_id: int = Depends(deps.get_current_active_centro),
    current_user: Usuario = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Obtener lista de usuarios. 
    Superusuarios ven TODOS los usuarios de la base de datos (excepto a sí mismos).
    Administradores de centro ven solo los usuarios activos de su centro.
    """
    resultados = []
    
    if current_user.es_superusuario:
        usuarios_db = db.query(Usuario).filter(Usuario.id != current_user.id).offset(skip).limit(limit).all()
        for u in usuarios_db:
            d = db.query(Docente).filter(Docente.correo == u.correo).first()
            
            urs = db.query(UsuarioRol).filter(UsuarioRol.usuario_id == u.id).all()
            roles_nombres = []
            for ur in urs:
                r = db.query(Rol).filter(Rol.id == ur.rol_id).first()
                if r:
                    roles_nombres.append(r.nombre.value if hasattr(r.nombre, 'value') else r.nombre)
            
            es_activo = u.es_activo
            if not urs:
                es_activo = False
                
            resultados.append({
                "id": u.id,
                "correo": u.correo,
                "nombre_completo": u.nombre_completo,
                "es_activo": es_activo,
                "roles": list(set(roles_nombres)) if roles_nombres else ["SIN ROL / CENTRO"],
                "docente_id": d.id if d else None,
                "cedula": d.cedula if d else None,
                "telefono": d.telefono if d else None,
                "especialidad": d.especialidad if d else None,
                "centro_id": urs[0].centro_id if urs else None
            })
    else:
        # Lógica para usuarios regulares (administradores de centro)
        usuarios_roles = db.query(UsuarioRol).filter(UsuarioRol.centro_id == centro_id).offset(skip).limit(limit).all()
        us_map = {}
        for ur in usuarios_roles:
            if ur.usuario_id not in us_map:
                u = db.query(Usuario).filter(Usuario.id == ur.usuario_id, Usuario.id != current_user.id, Usuario.es_activo == True).first()
                if not u: continue
                
                d = db.query(Docente).filter(Docente.correo == u.correo).first()
                
                us_map[ur.usuario_id] = {
                    "id": u.id,
                    "correo": u.correo,
                    "nombre_completo": u.nombre_completo,
                    "es_activo": u.es_activo,
                    "roles": [],
                    "docente_id": d.id if d else None,
                    "cedula": d.cedula if d else None,
                    "telefono": d.telefono if d else None,
                    "especialidad": d.especialidad if d else None,
                    "centro_id": centro_id
                }
                
            r = db.query(Rol).filter(Rol.id == ur.rol_id).first()
            if r:
                us_map[ur.usuario_id]["roles"].append(r.nombre.value if hasattr(r.nombre, 'value') else r.nombre)
                
        for k, v in us_map.items():
            resultados.append(v)
            
    return resultados

@router.post("/", response_model=UsuarioResponseUnificada)
def create_usuario_unificado(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UsuarioCreacionUnificada,
    centro_id: int = Depends(deps.get_current_active_centro),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    """
    Crea un Usuario con su Rol. Siempre crea también el registro Docente (Personal) asociado.
    """
    if current_user.es_superusuario and user_in.centro_id:
        centro_id = user_in.centro_id
        
    rol_db = db.query(Rol).filter(Rol.nombre == user_in.rol_nombre).first()
    if not rol_db:
        raise HTTPException(status_code=400, detail="El rol especificado no existe en la base de datos.")

    if rol_db.nombre == RolNombreTipo.ADMINISTRADOR and not current_user.es_superusuario:
        raise HTTPException(status_code=403, detail="Solo el superusuario puede crear Administradores de Centro.")

    # 1. Validar existencia previa
    existente = db.query(Usuario).filter(Usuario.correo == user_in.correo).first()
    
    if existente:
        docente = db.query(Docente).filter(Docente.correo == user_in.correo).first()
        if docente and docente.cedula != user_in.cedula:
            raise HTTPException(status_code=400, detail="El correo ya pertenece a un usuario, pero la cédula no coincide con nuestros registros.")
            
        ur = db.query(UsuarioRol).filter(UsuarioRol.usuario_id == existente.id, UsuarioRol.centro_id == centro_id).first()
        
        if ur:
            if existente.es_activo:
                raise HTTPException(status_code=400, detail="El usuario ya está registrado y activo en este centro.")
            else:
                # REACTIVAR USUARIO
                existente.es_activo = True
                existente.nombre_completo = f"{user_in.primer_nombre} {user_in.primer_apellido}"
                if docente:
                    docente.es_activo = True
                    docente.primer_nombre = user_in.primer_nombre
                    docente.segundo_nombre = user_in.segundo_nombre
                    docente.primer_apellido = user_in.primer_apellido
                    docente.segundo_apellido = user_in.segundo_apellido
                    docente.telefono = user_in.telefono
                    docente.titulo_academico = user_in.titulo_academico
                    docente.especialidad = user_in.especialidad
                    docente.sexo = user_in.sexo
                
                ur.rol_id = rol_db.id
                db.commit()
                db.refresh(existente)
                
                return {
                    "id": existente.id,
                    "correo": existente.correo,
                    "nombre_completo": existente.nombre_completo,
                    "es_activo": existente.es_activo,
                    "roles": [rol_db.nombre.value if hasattr(rol_db.nombre, 'value') else rol_db.nombre],
                    "docente_id": docente.id if docente else None,
                    "cedula": docente.cedula if docente else None,
                    "telefono": docente.telefono if docente else None,
                    "especialidad": docente.especialidad if docente else None
                }
        else:
            raise HTTPException(status_code=400, detail="El correo ya pertenece a un usuario de otro centro. La gestión multi-centro debe realizarse por soporte.")
            
    # Si no existe en absoluto, procedemos a crearlo:
    if db.query(Docente).filter(Docente.cedula == user_in.cedula).first():
        raise HTTPException(status_code=400, detail="La cédula ya está registrada con otro correo.")

    # 2. Generar clave y crear Usuario
    pwd = generar_password_defecto(user_in.primer_nombre, user_in.primer_apellido, user_in.cedula)
    nombre_comp = f"{user_in.primer_nombre} {user_in.primer_apellido}"
    
    db_usuario = Usuario(
        correo=user_in.correo,
        hashed_password=get_password_hash(pwd),
        nombre_completo=nombre_comp,
        es_superusuario=False
    )
    db.add(db_usuario)
    db.flush()
    
    # 3. Asignar Rol
    db_ur = UsuarioRol(
        usuario_id=db_usuario.id,
        rol_id=rol_db.id,
        centro_id=centro_id
    )
    db.add(db_ur)
    
    # 4. Crear Perfil Personal (Docente)
    db_docente = Docente(
        cedula=user_in.cedula,
        primer_nombre=user_in.primer_nombre,
        segundo_nombre=user_in.segundo_nombre,
        primer_apellido=user_in.primer_apellido,
        segundo_apellido=user_in.segundo_apellido,
        sexo=user_in.sexo,
        correo=user_in.correo,
        telefono=user_in.telefono,
        titulo_academico=user_in.titulo_academico,
        especialidad=user_in.especialidad,
        centro_id=centro_id
    )
    db.add(db_docente)
    
    db.commit()
    db.refresh(db_usuario)
    db.refresh(db_docente)
    
    return {
        "id": db_usuario.id,
        "correo": db_usuario.correo,
        "nombre_completo": db_usuario.nombre_completo,
        "es_activo": db_usuario.es_activo,
        "roles": [rol_db.nombre.value if hasattr(rol_db.nombre, 'value') else rol_db.nombre],
        "docente_id": db_docente.id,
        "cedula": db_docente.cedula,
        "telefono": db_docente.telefono,
        "especialidad": db_docente.especialidad
    }

@router.put("/{usuario_id}", response_model=UsuarioResponseUnificada)
def update_usuario(
    usuario_id: int,
    user_in: UsuarioCreacionUnificada,
    db: Session = Depends(deps.get_db),
    centro_id: int = Depends(deps.get_current_active_centro),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    # 1. Obtener y validar el rol solicitado
    rol_db = db.query(Rol).filter(Rol.nombre == user_in.rol_nombre).first()
    if not rol_db:
        raise HTTPException(status_code=400, detail="El rol especificado no existe.")
        
    if rol_db.nombre == RolNombreTipo.ADMINISTRADOR and not current_user.es_superusuario:
        raise HTTPException(status_code=403, detail="Solo el superusuario puede asignar o editar el rol de Administrador.")

    # 2. Determinar centro_id a asignar
    if current_user.es_superusuario and user_in.centro_id:
        centro_id_asignar = user_in.centro_id
    else:
        centro_id_asignar = centro_id
        
    # 3. Obtener usuario base
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    # 4. Obtener o crear UsuarioRol
    ur = db.query(UsuarioRol).filter(UsuarioRol.usuario_id == usuario_id).first()
    
    if not current_user.es_superusuario:
        if ur and ur.centro_id != centro_id:
            raise HTTPException(status_code=403, detail="No puedes editar a un usuario de otro centro.")
        elif not ur and not usuario.es_activo:
            # Para usuarios inactivos sin centro, solo el superusuario puede reasignarlos o el admin de su centro si no tuvieran (pero ya no sabemos de qué centro eran).
            # En este sistema, solo el superusuario reactivaría a uno "huérfano".
            raise HTTPException(status_code=403, detail="No tienes permisos para reactivar usuarios sin centro. Contacta soporte.")
            
    # Validar si el usuario actual ya era administrador y lo intenta editar un no superusuario
    if not current_user.es_superusuario and ur:
        rol_actual = db.query(Rol).filter(Rol.id == ur.rol_id).first()
        if rol_actual and rol_actual.nombre == RolNombreTipo.ADMINISTRADOR:
            raise HTTPException(status_code=403, detail="No tienes permisos para editar a un Administrador de Centro.")

    docente = db.query(Docente).filter(Docente.correo == usuario.correo).first()
    
    # Validaciones de unicidad (si cambia correo o cédula)
    if user_in.correo != usuario.correo and db.query(Usuario).filter(Usuario.correo == user_in.correo).first():
        raise HTTPException(status_code=400, detail="El correo ya pertenece a otro usuario.")
    if docente and user_in.cedula != docente.cedula and db.query(Docente).filter(Docente.cedula == user_in.cedula).first():
        raise HTTPException(status_code=400, detail="La cédula ya está registrada en otro perfil.")

    # Actualizar Usuario
    usuario.correo = user_in.correo
    usuario.nombre_completo = f"{user_in.primer_nombre} {user_in.primer_apellido}"
    usuario.es_activo = True # Reactivarlo si estaba inactivo
    
    # Actualizar o Crear Rol
    if ur:
        ur.rol_id = rol_db.id
        ur.centro_id = centro_id_asignar
    else:
        ur = UsuarioRol(usuario_id=usuario_id, rol_id=rol_db.id, centro_id=centro_id_asignar)
        db.add(ur)

    # Actualizar Docente
    if docente:
        docente.es_activo = True
        docente.cedula = user_in.cedula
        docente.primer_nombre = user_in.primer_nombre
        docente.segundo_nombre = user_in.segundo_nombre
        docente.primer_apellido = user_in.primer_apellido
        docente.segundo_apellido = user_in.segundo_apellido
        docente.sexo = user_in.sexo
        docente.correo = user_in.correo
        docente.telefono = user_in.telefono
        docente.titulo_academico = user_in.titulo_academico
        docente.especialidad = user_in.especialidad
    
    db.commit()
    db.refresh(usuario)
    if docente: db.refresh(docente)
    
    return {
        "id": usuario.id,
        "correo": usuario.correo,
        "nombre_completo": usuario.nombre_completo,
        "es_activo": usuario.es_activo,
        "roles": [rol_db.nombre.value if hasattr(rol_db.nombre, 'value') else rol_db.nombre],
        "docente_id": docente.id if docente else None,
        "cedula": docente.cedula if docente else None,
        "telefono": docente.telefono if docente else None,
        "especialidad": docente.especialidad if docente else None
    }

@router.post("/{usuario_id}/reset-password")
def reset_password(
    usuario_id: int,
    db: Session = Depends(deps.get_db),
    centro_id: int = Depends(deps.get_current_active_centro)
) -> Any:
    ur = db.query(UsuarioRol).filter(UsuarioRol.usuario_id == usuario_id, UsuarioRol.centro_id == centro_id).first()
    if not ur:
        raise HTTPException(status_code=404, detail="Usuario no encontrado en este centro.")
        
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    docente = db.query(Docente).filter(Docente.correo == usuario.correo).first()
    
    if not docente:
        raise HTTPException(status_code=400, detail="Este usuario no tiene datos de perfil asociados para generar la contraseña.")
        
    from app.core.security import get_password_hash
    nueva_pwd = generar_password_defecto(docente.primer_nombre, docente.primer_apellido, docente.cedula)
    usuario.hashed_password = get_password_hash(nueva_pwd)
    db.commit()
    return {"message": "Contraseña restaurada exitosamente", "nueva_password": nueva_pwd}

@router.delete("/{usuario_id}")
def deactivate_usuario(
    usuario_id: int,
    db: Session = Depends(deps.get_db),
    centro_id: int = Depends(deps.get_current_active_centro),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    # Obtener el rol del usuario para validar
    query_ur = db.query(UsuarioRol).filter(UsuarioRol.usuario_id == usuario_id)
    if not current_user.es_superusuario:
        query_ur = query_ur.filter(UsuarioRol.centro_id == centro_id)
        
    ur = query_ur.first()
    
    if not current_user.es_superusuario and not ur:
        raise HTTPException(status_code=404, detail="Usuario no encontrado en este centro.")
        
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    if not current_user.es_superusuario and ur:
        rol_actual = db.query(Rol).filter(Rol.id == ur.rol_id).first()
        if rol_actual and rol_actual.nombre == RolNombreTipo.ADMINISTRADOR:
            raise HTTPException(status_code=403, detail="No tienes permisos para desactivar a un Administrador de Centro.")
        
    usuario.es_activo = False
    
    # Eliminar roles del usuario (lo desconecta de cualquier centro)
    # Como un usuario inactivo no debe tener centro, borramos todas sus asignaciones de rol
    db.query(UsuarioRol).filter(UsuarioRol.usuario_id == usuario_id).delete()

    
    docente = db.query(Docente).filter(Docente.correo == usuario.correo).first()
    if docente:
        docente.es_activo = False
        
    db.commit()
    return {"message": "Usuario desactivado exitosamente."}
