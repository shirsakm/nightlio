from api.utils.is_truthy import is_truthy


def test_is_truthy_true_values():
    for v in ["1", "true", "TRUE", " yes ", "On", True]:
        assert is_truthy(v) is True


def test_is_truthy_false_values():
    for v in [None, "0", "false", "no", "off", "", False, "  "]:
        assert is_truthy(v) is False
