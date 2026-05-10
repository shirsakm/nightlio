from flask import Flask
from api.utils.error_handlers import setup_error_handlers
import json

def test_setup_error_handlers():
    app = Flask(__name__)
    setup_error_handlers(app)
    
    with app.test_client() as client:
        # Test 404
        response = client.get("/non-existent-route")
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data["error"] == "Resource not found"

        # Note: 400 and ValueError might require simulating specific route triggers 
        # or specific app logic which goes beyond a very simple test.
