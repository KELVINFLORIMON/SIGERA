import sys
import os

# Asegurar que el path del backend esté en sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.institucional import Regional, Distrito

distritos_minerd = [
    # Regional 01
    {"reg": "01", "codigo": "01-01", "nombre": "Pedernales"},
    {"reg": "01", "codigo": "01-02", "nombre": "Enriquillo"},
    {"reg": "01", "codigo": "01-03", "nombre": "Barahona"},
    {"reg": "01", "codigo": "01-04", "nombre": "Cabral"},
    {"reg": "01", "codigo": "01-05", "nombre": "Vicente Noble"},
    # Regional 02
    {"reg": "02", "codigo": "02-01", "nombre": "Comendador"},
    {"reg": "02", "codigo": "02-02", "nombre": "Bánica"},
    {"reg": "02", "codigo": "02-03", "nombre": "Las Matas de Farfán"},
    {"reg": "02", "codigo": "02-04", "nombre": "El Cercado"},
    {"reg": "02", "codigo": "02-05", "nombre": "San Juan Este"},
    {"reg": "02", "codigo": "02-06", "nombre": "San Juan Oeste"},
    {"reg": "02", "codigo": "02-07", "nombre": "Hondo Valle"},
    # Regional 03
    {"reg": "03", "codigo": "03-01", "nombre": "Azua"},
    {"reg": "03", "codigo": "03-02", "nombre": "Padre Las Casas"},
    {"reg": "03", "codigo": "03-03", "nombre": "San José de Ocoa"},
    {"reg": "03", "codigo": "03-04", "nombre": "Baní"},
    {"reg": "03", "codigo": "03-05", "nombre": "Nizao"},
    # Regional 04
    {"reg": "04", "codigo": "04-01", "nombre": "Cambita Garabitos"},
    {"reg": "04", "codigo": "04-02", "nombre": "San Cristóbal Norte"},
    {"reg": "04", "codigo": "04-03", "nombre": "San Cristóbal Sur"},
    {"reg": "04", "codigo": "04-04", "nombre": "Villa Altagracia"},
    {"reg": "04", "codigo": "04-05", "nombre": "Yaguate"},
    {"reg": "04", "codigo": "04-06", "nombre": "Haina"},
    {"reg": "04", "codigo": "04-07", "nombre": "Nigua"},
    # Regional 05
    {"reg": "05", "codigo": "05-01", "nombre": "San Pedro de Macorís Este"},
    {"reg": "05", "codigo": "05-02", "nombre": "San Pedro de Macorís Oeste"},
    {"reg": "05", "codigo": "05-03", "nombre": "La Romana"},
    {"reg": "05", "codigo": "05-04", "nombre": "Hato Mayor"},
    {"reg": "05", "codigo": "05-05", "nombre": "Sabana de la Mar"},
    {"reg": "05", "codigo": "05-06", "nombre": "Consuelo"},
    {"reg": "05", "codigo": "05-07", "nombre": "San José de los Llanos"},
    {"reg": "05", "codigo": "05-08", "nombre": "Quisqueya"},
    {"reg": "05", "codigo": "05-09", "nombre": "El Valle"},
    {"reg": "05", "codigo": "05-10", "nombre": "Guaymate"},
    {"reg": "05", "codigo": "05-11", "nombre": "Villa Hermosa"},
    # Regional 06
    {"reg": "06", "codigo": "06-01", "nombre": "José Contreras"},
    {"reg": "06", "codigo": "06-02", "nombre": "Constanza"},
    {"reg": "06", "codigo": "06-03", "nombre": "Jarabacoa"},
    {"reg": "06", "codigo": "06-04", "nombre": "La Vega Oeste"},
    {"reg": "06", "codigo": "06-05", "nombre": "La Vega Este"},
    {"reg": "06", "codigo": "06-06", "nombre": "Moca"},
    {"reg": "06", "codigo": "06-07", "nombre": "Gaspar Hernández"},
    {"reg": "06", "codigo": "06-08", "nombre": "Jamao al Norte"},
    {"reg": "06", "codigo": "06-09", "nombre": "San Víctor"},
    {"reg": "06", "codigo": "06-10", "nombre": "Jima Abajo"},
    # Regional 07
    {"reg": "07", "codigo": "07-01", "nombre": "Tenares"},
    {"reg": "07", "codigo": "07-02", "nombre": "Salcedo"},
    {"reg": "07", "codigo": "07-03", "nombre": "Castillo"},
    {"reg": "07", "codigo": "07-04", "nombre": "Villa Riva"},
    {"reg": "07", "codigo": "07-05", "nombre": "San Francisco de Macorís Sur"},
    {"reg": "07", "codigo": "07-06", "nombre": "San Francisco de Macorís Norte"},
    {"reg": "07", "codigo": "07-07", "nombre": "Villa Tapia"},
    # Regional 08
    {"reg": "08", "codigo": "08-01", "nombre": "San José de las Matas"},
    {"reg": "08", "codigo": "08-02", "nombre": "Jánico"},
    {"reg": "08", "codigo": "08-03", "nombre": "Santiago Sur"},
    {"reg": "08", "codigo": "08-04", "nombre": "Santiago Noroeste"},
    {"reg": "08", "codigo": "08-05", "nombre": "Santiago Centro Oeste"},
    {"reg": "08", "codigo": "08-06", "nombre": "Santiago Nordeste"},
    {"reg": "08", "codigo": "08-07", "nombre": "Villa Bisonó"},
    {"reg": "08", "codigo": "08-08", "nombre": "Licey al Medio"},
    {"reg": "08", "codigo": "08-09", "nombre": "Tamboril"},
    {"reg": "08", "codigo": "08-10", "nombre": "Villa González"},
    # Regional 09
    {"reg": "09", "codigo": "09-01", "nombre": "Mao"},
    {"reg": "09", "codigo": "09-02", "nombre": "Esperanza"},
    {"reg": "09", "codigo": "09-03", "nombre": "San Ignacio de Sabaneta"},
    {"reg": "09", "codigo": "09-04", "nombre": "Monción"},
    {"reg": "09", "codigo": "09-05", "nombre": "Laguna Salada"},
    {"reg": "09", "codigo": "09-06", "nombre": "Villa de los Almácigos"},
    # Regional 10
    {"reg": "10", "codigo": "10-01", "nombre": "Villa Mella"},
    {"reg": "10", "codigo": "10-02", "nombre": "Sabana Perdida"},
    {"reg": "10", "codigo": "10-03", "nombre": "Santo Domingo Noroeste"},
    {"reg": "10", "codigo": "10-04", "nombre": "Santo Domingo Oriental"},
    {"reg": "10", "codigo": "10-05", "nombre": "Boca Chica"},
    {"reg": "10", "codigo": "10-06", "nombre": "Mendoza"},
    {"reg": "10", "codigo": "10-07", "nombre": "San Antonio de Guerra"},
    # Regional 11
    {"reg": "11", "codigo": "11-01", "nombre": "Sosúa"},
    {"reg": "11", "codigo": "11-02", "nombre": "Puerto Plata"},
    {"reg": "11", "codigo": "11-03", "nombre": "Imbert"},
    {"reg": "11", "codigo": "11-04", "nombre": "Luperón"},
    {"reg": "11", "codigo": "11-05", "nombre": "Altamira"},
    {"reg": "11", "codigo": "11-06", "nombre": "El Mamey"},
    {"reg": "11", "codigo": "11-07", "nombre": "Villa Isabela"},
    # Regional 12
    {"reg": "12", "codigo": "12-01", "nombre": "Higüey"},
    {"reg": "12", "codigo": "12-02", "nombre": "San Rafael del Yuma"},
    {"reg": "12", "codigo": "12-03", "nombre": "El Seibo"},
    {"reg": "12", "codigo": "12-04", "nombre": "Miches"},
    # Regional 13
    {"reg": "13", "codigo": "13-01", "nombre": "Montecristi"},
    {"reg": "13", "codigo": "13-02", "nombre": "Guayubín"},
    {"reg": "13", "codigo": "13-03", "nombre": "Villa Vásquez"},
    {"reg": "13", "codigo": "13-04", "nombre": "Dajabón"},
    {"reg": "13", "codigo": "13-05", "nombre": "Loma de Cabrera"},
    {"reg": "13", "codigo": "13-06", "nombre": "Restauración"},
    # Regional 14
    {"reg": "14", "codigo": "14-01", "nombre": "Nagua"},
    {"reg": "14", "codigo": "14-02", "nombre": "Cabrera"},
    {"reg": "14", "codigo": "14-03", "nombre": "Río San Juan"},
    {"reg": "14", "codigo": "14-04", "nombre": "Samaná"},
    {"reg": "14", "codigo": "14-05", "nombre": "Sánchez"},
    {"reg": "14", "codigo": "14-06", "nombre": "El Factor"},
    {"reg": "14", "codigo": "14-07", "nombre": "Las Terrenas"},
    # Regional 15
    {"reg": "15", "codigo": "15-01", "nombre": "Los Alcarrizos"},
    {"reg": "15", "codigo": "15-02", "nombre": "Santo Domingo Centro"},
    {"reg": "15", "codigo": "15-03", "nombre": "Santo Domingo Sur Centro"},
    {"reg": "15", "codigo": "15-04", "nombre": "Santo Domingo Noroeste"},
    {"reg": "15", "codigo": "15-05", "nombre": "Herrera"},
    {"reg": "15", "codigo": "15-06", "nombre": "Pedro Brand"},
    # Regional 16
    {"reg": "16", "codigo": "16-01", "nombre": "Cotuí"},
    {"reg": "16", "codigo": "16-02", "nombre": "Fantino"},
    {"reg": "16", "codigo": "16-03", "nombre": "Cevicos"},
    {"reg": "16", "codigo": "16-04", "nombre": "Bonao Suroeste"},
    {"reg": "16", "codigo": "16-05", "nombre": "Piedra Blanca"},
    {"reg": "16", "codigo": "16-06", "nombre": "Bonao Noreste"},
    {"reg": "16", "codigo": "16-07", "nombre": "Villa La Mata"},
    # Regional 17
    {"reg": "17", "codigo": "17-01", "nombre": "Yamasá"},
    {"reg": "17", "codigo": "17-02", "nombre": "Monte Plata"},
    {"reg": "17", "codigo": "17-03", "nombre": "Bayaguana"},
    {"reg": "17", "codigo": "17-04", "nombre": "Sabana Grande de Boyá"},
    {"reg": "17", "codigo": "17-05", "nombre": "Peralvillo"},
    # Regional 18
    {"reg": "18", "codigo": "18-01", "nombre": "Neyba"},
    {"reg": "18", "codigo": "18-02", "nombre": "Tamayo"},
    {"reg": "18", "codigo": "18-03", "nombre": "Villa Jaragua"},
    {"reg": "18", "codigo": "18-04", "nombre": "Jimaní"},
    {"reg": "18", "codigo": "18-05", "nombre": "Duvergé"}
]

def seed_distritos():
    db = SessionLocal()
    try:
        # Load all regionales into memory mapped by code
        regionales = {r.codigo: r for r in db.query(Regional).all()}
        
        agregados = 0
        actualizados = 0
        for d_data in distritos_minerd:
            reg = regionales.get(d_data["reg"])
            if not reg:
                print(f"Advertencia: No se encontró la regional {d_data['reg']} para el distrito {d_data['codigo']}")
                continue
                
            distrito = db.query(Distrito).filter(Distrito.codigo == d_data["codigo"]).first()
            if not distrito:
                distrito = Distrito(
                    regional_id=reg.id,
                    codigo=d_data["codigo"],
                    nombre=d_data["nombre"],
                    es_activo=True
                )
                db.add(distrito)
                agregados += 1
            else:
                distrito.nombre = d_data["nombre"]
                distrito.regional_id = reg.id
                actualizados += 1
        
        db.commit()
        print(f"\nProceso finalizado. Se agregaron {agregados} nuevos distritos y se actualizaron {actualizados}.")
    except Exception as e:
        print(f"Error al poblar base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Iniciando carga de los 122 Distritos Educativos...")
    seed_distritos()
