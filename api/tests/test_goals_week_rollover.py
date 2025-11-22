from datetime import datetime, timedelta
import sqlite3

from api.app import create_app


def _week_start_iso(d=None):
    if d is None:
        d = datetime.now().date()
    # Monday as start of the week
    start = d - timedelta(days=d.weekday())
    return start.strftime("%Y-%m-%d")


def _auth_headers(client):
    resp = client.post("/api/auth/local/login")
    assert resp.status_code == 200
    data = resp.get_json()
    token = data["token"]
    return {"Authorization": f"Bearer {token}"}


def test_goals_reset_on_new_week_list_endpoint(tmp_path):
    app = create_app("testing")
    client = app.test_client()

    # Login and create a goal with freq 7
    headers = _auth_headers(client)
    resp = client.post(
        "/api/goals",
        json={"title": "Daily Walk", "description": "30 mins", "frequency_per_week": 7},
        headers=headers,
    )
    assert resp.status_code in (200, 201)
    goal_id = resp.get_json().get("id")
    assert goal_id

    # Mutate DB to simulate last week's state with partial completion (3/7) and period_start last week
    db_path = app.config.get("DATABASE_PATH") or "/tmp/nightlio_test.db"
    last_week_monday = _week_start_iso(datetime.now().date() - timedelta(days=7))
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            "UPDATE goals SET completed = ?, period_start = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (3, last_week_monday, goal_id),
        )
        conn.commit()

    # Fetch goals; backend should rollover to current week (completed back to 0)
    resp = client.get("/api/goals", headers=headers)
    assert resp.status_code == 200
    lst = resp.get_json()
    assert isinstance(lst, list)
    g = next((x for x in lst if x["id"] == goal_id), None)
    assert g is not None
    assert g["completed"] == 0, "expected completed to reset at new week start"
    assert g["period_start"] == _week_start_iso()
