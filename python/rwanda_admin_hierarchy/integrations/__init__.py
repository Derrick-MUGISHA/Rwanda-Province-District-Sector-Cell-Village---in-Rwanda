"""Optional web-framework integrations.

The base package has no dependencies. These modules wire the dataset into a
framework you already use; install the matching extra:

    pip install "rwanda-admin-hierarchy[fastapi]"
    pip install "rwanda-admin-hierarchy[django]"
"""

from __future__ import annotations

from typing import Any

# Child collections are stripped from list endpoints: a full province subtree
# is megabytes of JSON, while pickers only need one level at a time.
_CHILD_KEYS = frozenset({"districts", "sectors", "cells", "villages"})


def summarize(node: dict[str, Any]) -> dict[str, Any]:
  """Returns the node without its child collections."""
  return {key: value for key, value in node.items() if key not in _CHILD_KEYS}
