import os
import pytest

from api.app import create_app

TEST_DB_PATH = "/tmp/nightlio_test.db"


def _reset_test_db():
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)


@pytest.fixture()
def client():
    _reset_test_db()
    app = create_app("testing")
    with app.test_client() as test_client:
        yield test_client
    _reset_test_db()


def _auth_headers(client):
    resp = client.post("/api/auth/local/login")
    assert resp.status_code == 200
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_update_mood_entry_returns_updated_payload(client):
    headers = _auth_headers(client)

    # Seed two group options to exercise selection replacement logic
    group_resp = client.post("/api/groups", json={"name": "Energy"})
    assert group_resp.status_code == 201
    group_id = group_resp.get_json()["group_id"]

    option_a = client.post(f"/api/groups/{group_id}/options", json={"name": "Focused"})
    option_b = client.post(f"/api/groups/{group_id}/options", json={"name": "Relaxed"})
    assert option_a.status_code == 201
    assert option_b.status_code == 201
    option_a_id = option_a.get_json()["option_id"]
    option_b_id = option_b.get_json()["option_id"]

    # Create an entry with the first option selected
    create_resp = client.post(
        "/api/mood",
        headers=headers,
        json={
            "mood": 3,
            "date": "2024-01-02",
            "content": "Initial reflection",
            "selected_options": [option_a_id],
        },
    )
    assert create_resp.status_code == 201
    entry_id = create_resp.get_json()["entry_id"]

    # Update mood, content, and swap to the second option
    update_resp = client.put(
        f"/api/mood/{entry_id}",
        headers=headers,
        json={
            "mood": 4,
            "content": "Updated reflection",
            "selected_options": [option_b_id],
        },
    )
    assert update_resp.status_code == 200
    update_data = update_resp.get_json()
    assert update_data["status"] == "success"
    updated_entry = update_data["entry"]
    assert updated_entry["mood"] == 4
    assert updated_entry["content"] == "Updated reflection"
    assert [sel["id"] for sel in updated_entry["selections"]] == [option_b_id]

    # Clear selections to ensure removal works
    clear_resp = client.put(
        f"/api/mood/{entry_id}",
        headers=headers,
        json={"selected_options": []},
    )
    assert clear_resp.status_code == 200
    cleared_entry = clear_resp.get_json()["entry"]
    assert cleared_entry["selections"] == []
    assert cleared_entry["mood"] == 4  # mood remains unchanged when not provided

    # Fetch the entry to ensure persistence
    fetch_resp = client.get(f"/api/mood/{entry_id}", headers=headers)
    assert fetch_resp.status_code == 200
    fetched = fetch_resp.get_json()
    assert fetched["content"] == "Updated reflection"
    selections_resp = client.get(f"/api/mood/{entry_id}/selections", headers=headers)
    assert selections_resp.status_code == 200
    assert selections_resp.get_json() == []
