#!/usr/bin/env python3
import json
import re
import subprocess
from collections import OrderedDict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = REPO_ROOT / "List_of_Villages_for_all_technology.pdf"
OUTPUT_PATH = REPO_ROOT / "data" / "rwanda-administrative.json"

PROVINCES = sorted(
    [
        "Umujyi wa Kigali",
        "Iburengerazuba",
        "Iburasirazuba",
        "Amajyaruguru",
        "Amajyepfo",
    ],
    key=len,
    reverse=True,
)


def slug(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "unknown"


def parse_row(line: str):
    candidate = re.sub(r"\s+", " ", line.strip())
    candidate = re.sub(r"([A-Za-z])([0-9]{8,10}\b)", r"\1 \2", candidate)
    m = re.match(r"^(.*?)\s+([0-9]{8,10})\s+([A-Za-z]{2})$", candidate)
    if not m:
        return None

    body, village_code, _result = m.groups()
    province = None
    for p in PROVINCES:
        if body.startswith(f"{p} "):
            province = p
            body = body[len(p) :].strip()
            break

    if province is None:
        return None

    parts = body.split(" ")
    if len(parts) < 4:
        return None

    district = parts[0]
    sector = parts[1]
    cell = parts[2]
    village = " ".join(parts[3:]).strip()
    if not village:
        return None

    return province, district, sector, cell, village, village_code


def main():
    text = subprocess.check_output(
        ["pdftotext", "-layout", str(PDF_PATH), "-"], text=True, errors="ignore"
    )
    lines = text.splitlines()

    root = {"country": "Rwanda", "version": "1.0.0", "provinces": []}
    province_map = OrderedDict()

    parsed = 0
    skipped = 0
    carry = None

    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        if line.startswith("Province District Sector Cellule Village Vill_Code"):
            continue
        if line.startswith("-- ") and " of " in line and line.endswith(" --"):
            continue

        candidate = line
        if carry:
            merged = f"{carry} {line}"
            row = parse_row(merged)
            if row:
                candidate = merged
                carry = None
            else:
                if re.search(r"[0-9]{8,10}\s+[A-Za-z]{2}$", line):
                    skipped += 1
                    carry = None
                    continue
                carry = line
                continue

        row = parse_row(candidate)
        if not row:
            if re.search(r"[0-9]{8,10}\s+[A-Za-z]{2}$", line):
                skipped += 1
            else:
                carry = line
            continue

        province, district, sector, cell, village, village_code = row

        province_id = f"province-{slug(province)}"
        district_id = f"{province_id}-district-{slug(district)}"
        sector_id = f"{district_id}-sector-{slug(sector)}"
        cell_id = f"{sector_id}-cell-{slug(cell)}"
        village_id = f"village-{village_code}"

        province_obj = province_map.get(province_id)
        if province_obj is None:
            province_obj = {
                "id": province_id,
                "name": province,
                "districts": [],
                "_district_map": OrderedDict(),
            }
            province_map[province_id] = province_obj

        district_obj = province_obj["_district_map"].get(district_id)
        if district_obj is None:
            district_obj = {
                "id": district_id,
                "name": district,
                "sectors": [],
                "_sector_map": OrderedDict(),
            }
            province_obj["_district_map"][district_id] = district_obj
            province_obj["districts"].append(district_obj)

        sector_obj = district_obj["_sector_map"].get(sector_id)
        if sector_obj is None:
            sector_obj = {
                "id": sector_id,
                "name": sector,
                "cells": [],
                "_cell_map": OrderedDict(),
            }
            district_obj["_sector_map"][sector_id] = sector_obj
            district_obj["sectors"].append(sector_obj)

        cell_obj = sector_obj["_cell_map"].get(cell_id)
        if cell_obj is None:
            cell_obj = {
                "id": cell_id,
                "name": cell,
                "villages": [],
                "_village_ids": set(),
                "_village_names": set(),
            }
            sector_obj["_cell_map"][cell_id] = cell_obj
            sector_obj["cells"].append(cell_obj)

        normalized_village_name = village.lower().strip()
        if (
            village_id not in cell_obj["_village_ids"]
            and normalized_village_name not in cell_obj["_village_names"]
        ):
            cell_obj["_village_ids"].add(village_id)
            cell_obj["_village_names"].add(normalized_village_name)
            cell_obj["villages"].append({"id": village_id, "name": village})
            parsed += 1

    for p in province_map.values():
        for d in p["districts"]:
            for s in d["sectors"]:
                for c in s["cells"]:
                    c.pop("_village_ids", None)
                    c.pop("_village_names", None)
                s.pop("_cell_map", None)
            d.pop("_sector_map", None)
        p.pop("_district_map", None)

    root["provinces"] = list(province_map.values())
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(root, ensure_ascii=True, indent=2), encoding="utf-8")

    print(f"Wrote {OUTPUT_PATH}")
    print(f"Parsed rows: {parsed}")
    print(f"Skipped rows: {skipped}")
    print(f"Provinces: {len(root['provinces'])}")


if __name__ == "__main__":
    main()
