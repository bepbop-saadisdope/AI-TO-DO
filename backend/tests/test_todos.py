"""End-to-end tests for the /api/todos endpoints (spec §2.4 criterion #1).

These drive the real router → service → repository → Postgres stack via a
TestClient; only the DB session is swapped for a rolled-back one (see conftest).
"""


def _create(client, **overrides):
    """Helper: POST a todo, applying any field overrides, return the response."""
    payload = {"title": "Sample task"}
    payload.update(overrides)
    return client.post("/api/todos", json=payload)


# --- create -----------------------------------------------------------------


def test_create_returns_201_and_server_fields(client):
    resp = _create(client, title="Prepare demo", priority="high", tags=["work"])
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "Prepare demo"
    assert body["priority"] == "high"
    assert body["tags"] == ["work"]
    # Server-owned fields are populated.
    assert body["id"]
    assert body["status"] == "todo"  # default
    assert body["created_at"] and body["updated_at"]


def test_create_empty_title_is_422(client):
    assert _create(client, title="").status_code == 422


def test_create_title_too_long_is_422(client):
    assert _create(client, title="x" * 201).status_code == 422


def test_create_bad_enum_is_422(client):
    assert _create(client, priority="urgent").status_code == 422


# --- read -------------------------------------------------------------------


def test_get_existing_returns_200(client):
    todo_id = _create(client).json()["id"]
    resp = client.get(f"/api/todos/{todo_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == todo_id


def test_get_missing_returns_404(client):
    missing = "00000000-0000-0000-0000-000000000000"
    assert client.get(f"/api/todos/{missing}").status_code == 404


def test_list_returns_all(client):
    _create(client, title="a")
    _create(client, title="b")
    resp = client.get("/api/todos")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_list_filters_by_status(client):
    _create(client, title="open one")
    _create(client, title="finished", status="done")
    resp = client.get("/api/todos", params={"status": "done"})
    titles = [t["title"] for t in resp.json()]
    assert titles == ["finished"]


def test_list_filters_by_priority(client):
    _create(client, title="low one", priority="low")
    _create(client, title="high one", priority="high")
    resp = client.get("/api/todos", params={"priority": "high"})
    assert [t["title"] for t in resp.json()] == ["high one"]


# --- update -----------------------------------------------------------------


def test_patch_updates_only_sent_fields(client):
    created = _create(client, title="original", description="keep me").json()
    resp = client.patch(f"/api/todos/{created['id']}", json={"status": "done"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "done"
    assert body["title"] == "original"      # untouched
    assert body["description"] == "keep me"  # untouched
    assert body["updated_at"] >= created["updated_at"]


def test_patch_missing_returns_404(client):
    missing = "00000000-0000-0000-0000-000000000000"
    assert client.patch(f"/api/todos/{missing}", json={"status": "done"}).status_code == 404


def test_patch_invalid_value_is_422(client):
    todo_id = _create(client).json()["id"]
    assert client.patch(f"/api/todos/{todo_id}", json={"status": "nope"}).status_code == 422


# --- delete -----------------------------------------------------------------


def test_delete_returns_204_then_404(client):
    todo_id = _create(client).json()["id"]
    assert client.delete(f"/api/todos/{todo_id}").status_code == 204
    assert client.get(f"/api/todos/{todo_id}").status_code == 404


def test_delete_missing_returns_404(client):
    missing = "00000000-0000-0000-0000-000000000000"
    assert client.delete(f"/api/todos/{missing}").status_code == 404
