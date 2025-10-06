import json

from api.config import get_config, config_to_public_dict


def test_public_config_shape():
    cfg = get_config()
    public = config_to_public_dict(cfg)
    assert set(public.keys()) == {"enable_google_oauth", "google_client_id"}
    assert isinstance(public["enable_google_oauth"], bool)
    assert public["google_client_id"] is None or isinstance(
        public["google_client_id"], str
    )
    # Web3 flag removed


def test_public_config_default_values():
    cfg = get_config()
    public = config_to_public_dict(cfg)
    assert public["enable_google_oauth"] in (True, False)
    assert public["google_client_id"] is None or isinstance(
        public["google_client_id"], str
    )
    # Web3 flag removed
