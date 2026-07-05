"""Django integration.

Usage (in your project's urls.py):

    from django.urls import include, path

    urlpatterns = [
        path("api/rwanda/", include("rwanda_admin_hierarchy.integrations.django")),
    ]

Endpoints (relative to the include): meta, provinces,
provinces/<id>/districts, districts/<id>/sectors, sectors/<id>/cells,
cells/<id>/villages.
"""

from __future__ import annotations

from typing import Any

try:
  from django.http import JsonResponse
  from django.urls import path
  from django.views.decorators.http import require_GET
except ImportError as exc:  # pragma: no cover
  raise ImportError(
    'Django is not installed. Run: pip install "rwanda-admin-hierarchy[django]"'
  ) from exc

from .. import service
from . import summarize


def _list_response(nodes: list[dict[str, Any]] | None, kind: str, node_id: str) -> JsonResponse:
  if nodes is None:
    return JsonResponse({"error": f"Unknown {kind} id: {node_id}"}, status=404)
  return JsonResponse([summarize(node) for node in nodes], safe=False)


@require_GET
def meta(request) -> JsonResponse:
  return JsonResponse(service.get_data_meta())


@require_GET
def provinces(request) -> JsonResponse:
  return JsonResponse([summarize(p) for p in service.get_provinces()], safe=False)


@require_GET
def districts(request, province_id: str) -> JsonResponse:
  return _list_response(service.get_districts_by_province_id(province_id), "province", province_id)


@require_GET
def sectors(request, district_id: str) -> JsonResponse:
  return _list_response(service.get_sectors_by_district_id(district_id), "district", district_id)


@require_GET
def cells(request, sector_id: str) -> JsonResponse:
  return _list_response(service.get_cells_by_sector_id(sector_id), "sector", sector_id)


@require_GET
def villages(request, cell_id: str) -> JsonResponse:
  return _list_response(service.get_villages_by_cell_id(cell_id), "cell", cell_id)


urlpatterns = [
  path("meta", meta, name="rwanda-meta"),
  path("provinces", provinces, name="rwanda-provinces"),
  path("provinces/<str:province_id>/districts", districts, name="rwanda-districts"),
  path("districts/<str:district_id>/sectors", sectors, name="rwanda-sectors"),
  path("sectors/<str:sector_id>/cells", cells, name="rwanda-cells"),
  path("cells/<str:cell_id>/villages", villages, name="rwanda-villages"),
]
