import json
from pathlib import Path

_GRAPHS_PATH = Path(__file__).parent.parent / "seed-data" / "graphs.json"

if not _GRAPHS_PATH.exists():
    raise FileNotFoundError(f"Seed file not found: {_GRAPHS_PATH}")

try:
    with _GRAPHS_PATH.open(encoding="utf-8") as _f:
        _GRAPHS: list[dict] = json.load(_f)
except json.JSONDecodeError as exc:
    raise ValueError(f"Invalid JSON in seed file {_GRAPHS_PATH}: {exc}") from exc

_GRAPH_INDEX: dict[str, dict] = {g["id"]: g for g in _GRAPHS}


def get_graph(graph_id: str) -> dict | None:
    return _GRAPH_INDEX.get(graph_id)


def get_node(graph_id: str, node_id: str) -> dict | None:
    graph = _GRAPH_INDEX.get(graph_id)
    if graph is None:
        return None
    for node in graph.get("nodes", []):
        if node["id"] == node_id:
            return node
    return None
