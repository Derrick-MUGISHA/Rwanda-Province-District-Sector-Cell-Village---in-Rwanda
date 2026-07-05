"""FastAPI integration.

Usage:

    from fastapi import FastAPI
    from rwanda_admin_hierarchy.integrations.fastapi import create_router

    app = FastAPI()
    app.include_router(create_router(), prefix="/api/rwanda")

Endpoints (relative to the prefix): /meta, /provinces,
/provinces/{id}/districts, /districts/{id}/sectors, /sectors/{id}/cells,
/cells/{id}/villages.
"""

from __future__ import annotations

from typing import Any

from .. import service
from . import summarize


def create_router(**router_kwargs: Any):
  """Builds an APIRouter serving the hierarchy; kwargs go to APIRouter()."""
  try:
    from fastapi import APIRouter, HTTPException
  except ImportError as exc:  # pragma: no cover
    raise ImportError(
      'FastAPI is not installed. Run: pip install "rwanda-admin-hierarchy[fastapi]"'
    ) from exc

  router = APIRouter(**router_kwargs)

  def _or_404(nodes: list[dict[str, Any]] | None, kind: str, node_id: str):
    if nodes is None:
      raise HTTPException(status_code=404, detail=f"Unknown {kind} id: {node_id}")
    return [summarize(node) for node in nodes]

  @router.get("/meta")
  def meta() -> dict[str, Any]:
    return service.get_data_meta()

  @router.get("/provinces")
  def provinces() -> list[dict[str, Any]]:
    return [summarize(province) for province in service.get_provinces()]

  @router.get("/provinces/{province_id}/districts")
  def districts(province_id: str) -> list[dict[str, Any]]:
    return _or_404(service.get_districts_by_province_id(province_id), "province", province_id)

  @router.get("/districts/{district_id}/sectors")
  def sectors(district_id: str) -> list[dict[str, Any]]:
    return _or_404(service.get_sectors_by_district_id(district_id), "district", district_id)

  @router.get("/sectors/{sector_id}/cells")
  def cells(sector_id: str) -> list[dict[str, Any]]:
    return _or_404(service.get_cells_by_sector_id(sector_id), "sector", sector_id)

  @router.get("/cells/{cell_id}/villages")
  def villages(cell_id: str) -> list[dict[str, Any]]:
    return _or_404(service.get_villages_by_cell_id(cell_id), "cell", cell_id)

  return router
