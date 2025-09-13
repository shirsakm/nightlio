from api.app import create_app


def test_handle_oauth_login_idempotent():
    app = create_app("testing")
    user_service = app.extensions["user_service"]

    # Simulate Google identity payload
    provider = "google"
    sub = "test-google-sub-123"
    email = "user@example.com"
    name = "Test User"
    avatar = "https://example.com/a.png"

    u1 = user_service.handle_oauth_login(provider, sub, email, name, avatar)
    u2 = user_service.handle_oauth_login(provider, sub, email, name, avatar)

    assert u1["id"] == u2["id"]
    assert u2["email"] == email
    assert u2["name"] == name
