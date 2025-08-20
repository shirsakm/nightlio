from api.app import create_app


def test_local_login_success():
    app = create_app('testing')
    client = app.test_client()
    resp = client.post('/api/auth/local/login')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'token' in data
    assert 'user' in data and 'id' in data['user']
