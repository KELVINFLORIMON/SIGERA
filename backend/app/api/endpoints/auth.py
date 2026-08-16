from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.seguridad import Usuario, UsuarioRol, Rol
from app.schemas.token import Token
from app.schemas.usuario import Usuario as UsuarioSchema, UsuarioLoginResponse

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Endpoint para iniciar sesión. Recibe correo (username) y contraseña.
    Si son correctos, devuelve un token de acceso (JWT).
    (Nota: OAuth2PasswordRequestForm usa el campo 'username' por estándar, pero nosotros le pasamos el correo).
    """
    # 1. Buscamos el usuario por su correo
    user = db.query(Usuario).filter(Usuario.correo == form_data.username).first()
    
    # 2. Verificamos que exista y que la contraseña coincida con el hash
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.es_activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    # 3. Si todo está bien, creamos el token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login/test-token", response_model=UsuarioLoginResponse)
def test_token(
    current_user: Usuario = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
    # Optional dependency just in case the frontend sends it during test-token
    centro_id: str = None # or we can just read from request headers if we want, but let's just get the first one for now
) -> Any:
    """
    Endpoint para validar el token y obtener los datos del usuario logueado.
    Como usa Depends(deps.get_current_user), si el token es inválido, FastAPI bloquea la petición antes de llegar aquí.
    Si pasa, devuelve los datos del usuario.
    """
    from app.models.institucional import CentroEducativo
    roles_nombres = []
    cid = None
    cnombre = None
    
    # Obtener el primer centro y los roles si no es superusuario
    if not current_user.es_superusuario:
        urs = db.query(UsuarioRol).filter(UsuarioRol.usuario_id == current_user.id).all()
        if urs:
            cid = urs[0].centro_id
            centro = db.query(CentroEducativo).filter(CentroEducativo.id == cid).first()
            if centro:
                cnombre = centro.nombre
            for ur in urs:
                r = db.query(Rol).filter(Rol.id == ur.rol_id).first()
                if r:
                    roles_nombres.append(r.nombre.value if hasattr(r.nombre, 'value') else r.nombre)
    
    return {
        "id": current_user.id,
        "correo": current_user.correo,
        "nombre_completo": current_user.nombre_completo,
        "es_activo": current_user.es_activo,
        "es_superusuario": current_user.es_superusuario,
        "roles": list(set(roles_nombres)),
        "centro_id": cid,
        "centro_nombre": cnombre
    }
