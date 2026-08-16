import requests

# 1. Login
login_data = {
    'username': 'juan.perez@docente.edu.do',
    'password': 'docente123'
}
r1 = requests.post('http://localhost:8000/api/v1/login/access-token', data=login_data)
print("Login Status:", r1.status_code)
if r1.status_code == 200:
    token = r1.json()['access_token']
    print("Token obtained.")
    
    # 2. Test Token
    headers = {'Authorization': f'Bearer {token}'}
    r2 = requests.post('http://localhost:8000/api/v1/login/test-token', headers=headers)
    print("Test Token Status:", r2.status_code)
    print("Test Token Response:", r2.json())
else:
    print("Login Response:", r1.json())
