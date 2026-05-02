from __future__ import annotations

import json
from importlib import resources
from typing import Any

_CACHE: dict[str, Any] | None = None


def load_dataset() -> dict[str, Any]:
  global _CACHE
  if _CACHE is not None:
    return _CACHE

  dataset_text = resources.files("rwanda_admin_hierarchy").joinpath(
    "rwanda_administrative.json"
  ).read_text(encoding="utf-8")
  _CACHE = json.loads(dataset_text)
  return _CACHE


def get_dataset() -> dict[str, Any]:
  return load_dataset()


def get_provinces() -> list[dict[str, Any]]:
  return load_dataset().get("provinces", [])


def get_districts_by_province_id(province_id: str) -> list[dict[str, Any]] | None:
  for province in get_provinces():
    if province.get("id") == province_id:
      return province.get("districts", [])
  return None


def get_sectors_by_district_id(district_id: str) -> list[dict[str, Any]] | None:
  for province in get_provinces():
    for district in province.get("districts", []):
      if district.get("id") == district_id:
        return district.get("sectors", [])
  return None


def get_cells_by_sector_id(sector_id: str) -> list[dict[str, Any]] | None:
  for province in get_provinces():
    for district in province.get("districts", []):
      for sector in district.get("sectors", []):
        if sector.get("id") == sector_id:
          return sector.get("cells", [])
  return None


def get_villages_by_cell_id(cell_id: str) -> list[dict[str, Any]] | None:
  for province in get_provinces():
    for district in province.get("districts", []):
      for sector in district.get("sectors", []):
        for cell in sector.get("cells", []):
          if cell.get("id") == cell_id:
            return cell.get("villages", [])
  return None
