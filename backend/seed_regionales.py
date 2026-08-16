import sys
import os

# Asegurar que el path del backend esté en sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.institucional import Regional, Distrito

regionales_minerd = [
    {"codigo": "01", "nombre": "Barahona"},
    {"codigo": "02", "nombre": "San Juan de la Maguana"},
    {"codigo": "03", "nombre": "Azua"},
    {"codigo": "04", "nombre": "San Cristóbal"},
    {"codigo": "05", "nombre": "San Pedro de Macorís"},
    {"codigo": "06", "nombre": "La Vega"},
    {"codigo": "07", "nombre": "San Francisco de Macorís"},
    {"codigo": "08", "nombre": "Santiago"},
    {"codigo": "09", "nombre": "Mao"},
    {"codigo": "10", "nombre": "Santo Domingo II"},
    {"codigo": "11", "nombre": "Puerto Plata"},
    {"codigo": "12", "nombre": "Higüey"},
    {"codigo": "13", "nombre": "Montecristi"},
    {"codigo": "14", "nombre": "Nagua"},
    {"codigo": "15", "nombre": "Santo Domingo III"},
    {"codigo": "16", "nombre": "Cotuí"},
    {"codigo": "17", "nombre": "Monte Plata"},
    {"codigo": "18", "nombre": "Neyba"},
]

def seed_regionales():
    db = SessionLocal()
    try:
        agregadas = 0
        for reg_data in regionales_minerd:
            # Buscar si ya existe
            regional = db.query(Regional).filter(Regional.codigo == reg_data["codigo"]).first()
            if not regional:
                regional = Regional(codigo=reg_data["codigo"], nombre=reg_data["nombre"], es_activa=True)
                db.add(regional)
                db.commit()
                db.refresh(regional)
                agregadas += 1
                
                # Agregar un distrito principal por defecto para cada regional para que se puedan registrar centros
                distrito_codigo = f"{reg_data['codigo']}-01"
                distrito = Distrito(
                    regional_id=regional.id, 
                    codigo=distrito_codigo, 
                    nombre=f"Distrito Principal {reg_data['nombre']}", 
                    es_activo=True
                )
                db.add(distrito)
                db.commit()
                print(f"Regional agregada: {regional.codigo} - {regional.nombre} con distrito {distrito.codigo}")
            else:
                print(f"Regional {reg_data['codigo']} ya existe.")
                # Asegurar que al menos tenga 1 distrito
                distrito = db.query(Distrito).filter(Distrito.regional_id == regional.id).first()
                if not distrito:
                    distrito_codigo = f"{regional.codigo}-01"
                    distrito = Distrito(
                        regional_id=regional.id, 
                        codigo=distrito_codigo, 
                        nombre=f"Distrito Principal {regional.nombre}", 
                        es_activo=True
                    )
                    db.add(distrito)
                    db.commit()
                    print(f"  -> Distrito agregado a regional existente: {distrito.codigo}")
        
        print(f"\nProceso finalizado. Se agregaron {agregadas} nuevas regionales.")
    except Exception as e:
        print(f"Error al poblar base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Iniciando carga de Regionales y Distritos...")
    seed_regionales()
