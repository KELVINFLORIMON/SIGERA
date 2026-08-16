import requests

payload = {
    "codigo_minerd": "9999",
    "nombre": "Test Centro",
    "tanda_principal": "JEE",
    "modalidad": "ACADEMICA",
    "es_activo": True,
    "distrito_id": 1
}

try:
    print("Sending POST to /institucional/centros...")
    res = requests.post("http://localhost:8002/api/v1/institucional/centros", json=payload, timeout=5)
    print("Status:", res.status_code)
    print("Body:", res.text)
except Exception as e:
    print("Error:", e)
