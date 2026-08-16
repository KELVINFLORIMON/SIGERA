import requests
try:
    res = requests.post("http://localhost:8002/api/v1/login/access-token", data={"username": "admin@sigera.edu.do", "password": "admin"}, timeout=5)
    print("Status:", res.status_code)
    print("Body:", res.text)
except Exception as e:
    print("Error:", e)
