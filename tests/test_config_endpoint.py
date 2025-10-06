from api.app import create_app


def test_config_endpoint_client():
    app = create_app("testing")
    client = app.test_client()
    resp = client.get("/api/config")
    assert resp.status_code == 200
    data = resp.get_json()
    assert set(data.keys()) == {"enable_google_oauth", "google_client_id"}
    assert isinstance(data["enable_google_oauth"], bool)
    assert data["google_client_id"] is None or isinstance(data["google_client_id"], str)
