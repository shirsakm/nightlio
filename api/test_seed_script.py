from api.scripts.seed_selfhost_user import seed_selfhost_user


def test_seed_selfhost_user_idempotent():
    u1 = seed_selfhost_user()
    u2 = seed_selfhost_user()
    assert u1['id'] == u2['id']
