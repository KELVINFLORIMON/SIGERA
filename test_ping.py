import requests
try:
    res = requests.get("http://localhost:8002/api/v1/institucional/centros", timeout=5)
    print("Status:", res.status_code)
    print("Body:", res.text)
except Exception as e:
    print("Error:", e)
