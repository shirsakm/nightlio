from api.app import create_app


def test_oauth_routes_not_registered_when_disabled():
    app = create_app('testing')
    client = app.test_client()
    # With default config, oauth should be disabled -> expect 404
    assert client.get('/api/auth/login/google').status_code in (404, 405)
