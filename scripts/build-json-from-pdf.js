const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const pdfPath = path.join(repoRoot, "List_of_Villages_for_all_technology.pdf");
const outputPath = path.join(repoRoot, "data", "rwanda-administrative.json");

const provinces = [
  "Umujyi wa Kigali",
  "Iburengerazuba",
  "Iburasirazuba",
  "Amajyaruguru",
  "Amajyepfo",
].sort((a, b) => b.length - a.length);

function slug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
}

function parseRow(line) {
  let candidate = line.trim().replace(/\s+/g, " ");
  candidate = candidate.replace(/([A-Za-z])([0-9]{8,10}\b)/g, "$1 $2");
  const match = candidate.match(/^(.*?)\s+([0-9]{8,10})\s+([A-Za-z]{2})$/);
  if (!match) return null;

  let body = match[1];
  const villageCode = match[2];

  let province = null;
  for (const p of provinces) {
    if (body.startsWith(`${p} `)) {
      province = p;
      body = body.slice(p.length).trim();
      break;
    }
  }
  if (!province) return null;

  const parts = body.split(" ");
  if (parts.length < 4) return null;

  const district = parts[0];
  const sector = parts[1];
  const cell = parts[2];
  const village = parts.slice(3).join(" ").trim();
  if (!village) return null;

  return { province, district, sector, cell, village, villageCode };
}

function main() {
  const text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });
  const lines = text.split(/\r?\n/);

  const root = { country: "Rwanda", version: "1.0.0", provinces: [] };
  const provinceMap = new Map();

  let parsed = 0;
  let skipped = 0;
  let carry = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("Province District Sector Cellule Village Vill_Code")) continue;
    if (line.startsWith("-- ") && line.includes(" of ") && line.endsWith(" --")) continue;

    let candidate = line;
    if (carry) {
      const merged = `${carry} ${line}`;
      const row = parseRow(merged);
      if (row) {
        candidate = merged;
        carry = null;
      } else {
        if (/[0-9]{8,10}\s+[A-Za-z]{2}$/.test(line)) {
          skipped += 1;
          carry = null;
          continue;
        }
        carry = line;
        continue;
      }
    }

    const row = parseRow(candidate);
    if (!row) {
      if (/[0-9]{8,10}\s+[A-Za-z]{2}$/.test(line)) {
        skipped += 1;
      } else {
        carry = line;
      }
      continue;
    }

    const provinceId = `province-${slug(row.province)}`;
    const districtId = `${provinceId}-district-${slug(row.district)}`;
    const sectorId = `${districtId}-sector-${slug(row.sector)}`;
    const cellId = `${sectorId}-cell-${slug(row.cell)}`;
    const villageId = `village-${row.villageCode}`;
    const normalizedVillageName = row.village.toLowerCase().trim();

    let provinceObj = provinceMap.get(provinceId);
    if (!provinceObj) {
      provinceObj = {
        id: provinceId,
        name: row.province,
        districts: [],
        _districtMap: new Map(),
      };
      provinceMap.set(provinceId, provinceObj);
    }

    let districtObj = provinceObj._districtMap.get(districtId);
    if (!districtObj) {
      districtObj = {
        id: districtId,
        name: row.district,
        sectors: [],
        _sectorMap: new Map(),
      };
      provinceObj._districtMap.set(districtId, districtObj);
      provinceObj.districts.push(districtObj);
    }

    let sectorObj = districtObj._sectorMap.get(sectorId);
    if (!sectorObj) {
      sectorObj = {
        id: sectorId,
        name: row.sector,
        cells: [],
        _cellMap: new Map(),
      };
      districtObj._sectorMap.set(sectorId, sectorObj);
      districtObj.sectors.push(sectorObj);
    }

    let cellObj = sectorObj._cellMap.get(cellId);
    if (!cellObj) {
      cellObj = {
        id: cellId,
        name: row.cell,
        villages: [],
        _villageIds: new Set(),
        _villageNames: new Set(),
      };
      sectorObj._cellMap.set(cellId, cellObj);
      sectorObj.cells.push(cellObj);
    }

    if (!cellObj._villageIds.has(villageId) && !cellObj._villageNames.has(normalizedVillageName)) {
      cellObj._villageIds.add(villageId);
      cellObj._villageNames.add(normalizedVillageName);
      cellObj.villages.push({ id: villageId, name: row.village });
      parsed += 1;
    }
  }

  root.provinces = [...provinceMap.values()].map((province) => ({
    id: province.id,
    name: province.name,
    districts: province.districts.map((district) => ({
      id: district.id,
      name: district.name,
      sectors: district.sectors.map((sector) => ({
        id: sector.id,
        name: sector.name,
        cells: sector.cells.map((cell) => ({
          id: cell.id,
          name: cell.name,
          villages: cell.villages,
        })),
      })),
    })),
  }));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(root, null, 2), "utf8");

  console.log(`Wrote ${outputPath}`);
  console.log(`Parsed rows: ${parsed}`);
  console.log(`Skipped rows: ${skipped}`);
  console.log(`Provinces: ${root.provinces.length}`);
}

main();
