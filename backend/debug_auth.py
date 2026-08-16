from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

def test_token():
    token = create_access_token("2")
    response = client.post(
        "/api/v1/login/test-token",
        headers={"Authorization": f"Bearer {token}"}
    )
    print("STATUS:", response.status_code)
    print("BODY:", response.text)

if __name__ == "__main__":
    test_token()
