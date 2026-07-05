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

// Values of the "NEP results" column (National Electrification Plan):
// GE = grid extension, SAS = standalone solar, Microgrid = mini-grid.
const NEP_VALUES = ["GE", "SAS", "Microgrid"];

const ROW_PATTERN = new RegExp(`^(.*?)\\s+([0-9]{8,10})\\s+(${NEP_VALUES.join("|")})$`);

function slug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
}

function collapse(line) {
  let candidate = line.trim().replace(/\s+/g, " ");
  // Split digits fused onto the end of a name ("Nyamabuye35110107").
  return candidate.replace(/([A-Za-z])([0-9]{8,10}\b)/g, "$1 $2");
}

/**
 * Strict parse of a full row: "<province> <district> <sector> <cell> <village...> <code> <nep>".
 * Returns null when the province prefix is missing or columns are fused.
 */
function parseRow(line) {
  const match = collapse(line).match(ROW_PATTERN);
  if (!match) return null;

  let body = match[1];
  const villageCode = match[2];
  const nep = match[3];

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

  return { province, district, sector, cell, village, villageCode, nep };
}

function isHeaderOrPageMarker(line) {
  return (
    /^Province\s+District\s+Sector/.test(line) ||
    (line.startsWith("-- ") && line.includes(" of ") && line.endsWith(" --"))
  );
}

/**
 * First pass. pdftotext wraps long rows two ways:
 *  - a long village name pushes "<code> <nep>" onto its own next line;
 *  - a long sector name pushes the rest of the row group down, producing one
 *    "<province> <district> <sector>" line followed by many
 *    "<cell> <village> <code> <nep>" continuation lines.
 * A sticky prefix handles both: it is consumed by a code-only line (first
 * case) and retained across continuation lines (second case).
 */
function parseLines(lines) {
  const rows = [];
  const deferred = [];
  let prefix = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || isHeaderOrPageMarker(line)) continue;

    const direct = parseRow(line);
    if (direct) {
      rows.push(direct);
      prefix = null;
      continue;
    }

    const hasCode = /[0-9]{8,10}/.test(line);
    // A line that starts with a province name is a (possibly malformed) row of
    // its own; merging it into a pending prefix would glue two rows together.
    const startsNewRow = provinces.some((p) => line.startsWith(p));
    if (prefix && !startsNewRow) {
      const merged = parseRow(`${prefix} ${line}`);
      if (merged) {
        rows.push(merged);
        const codeOnly = new RegExp(`^[0-9]{8,10}\\s+(${NEP_VALUES.join("|")})$`).test(collapse(line));
        if (codeOnly) prefix = null; // prefix held the village name; used up
        continue;
      }
    }

    if (hasCode) {
      // Keep whatever context the prefix held; the recovery pass can strip
      // ancestor names it already knows and salvage the village name.
      deferred.push(prefix ? `${prefix} ${line}` : line);
      prefix = null;
    } else {
      prefix = line;
    }
  }

  return { rows, deferred };
}

/**
 * Second pass: recovers rows with fused columns ("NyamiramboCyivugiza") or
 * missing prefixes by using the hierarchy encoded in the village code
 * (province digit 1, district 2, sector 4, cell 6) and the names learned from
 * cleanly parsed rows. Kinyarwanda names are written with a single leading
 * capital, so fused columns can be split at internal lowercase→uppercase
 * boundaries; levels whose names are still unknown are assigned positionally.
 */
function recoverDeferred(deferred, rows) {
  const provinceByCode = new Map();
  const districtByCode = new Map();
  const sectorByCode = new Map();
  const cellByCode = new Map();
  for (const row of rows) {
    provinceByCode.set(row.villageCode.slice(0, 1), row.province);
    districtByCode.set(row.villageCode.slice(0, 2), row.district);
    sectorByCode.set(row.villageCode.slice(0, 4), row.sector);
    cellByCode.set(row.villageCode.slice(0, 6), row.cell);
  }

  const recovered = [];
  const unrecovered = [];

  for (const line of deferred) {
    const match = collapse(line)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .match(ROW_PATTERN);
    if (!match) {
      unrecovered.push(line);
      continue;
    }
    const villageCode = match[2];
    const nep = match[3];

    const province = provinceByCode.get(villageCode.slice(0, 1));
    if (!province) {
      unrecovered.push(line);
      continue;
    }

    let rest = match[1];
    if (rest.toLowerCase().startsWith(province.toLowerCase())) {
      rest = rest.slice(province.length).trim();
    }
    const tokens = rest.split(" ").filter(Boolean);

    // Consume one token per level: the known name when it matches, otherwise
    // the token itself becomes that level's name (learned for later rows).
    const levels = [
      { known: districtByCode.get(villageCode.slice(0, 2)), map: districtByCode, key: villageCode.slice(0, 2) },
      { known: sectorByCode.get(villageCode.slice(0, 4)), map: sectorByCode, key: villageCode.slice(0, 4) },
      { known: cellByCode.get(villageCode.slice(0, 6)), map: cellByCode, key: villageCode.slice(0, 6) },
    ];
    const names = [];
    let ok = true;
    for (const level of levels) {
      if (level.known && tokens[0] && tokens[0].toLowerCase() === level.known.toLowerCase()) {
        names.push(level.known);
        tokens.shift();
      } else if (level.known) {
        // Column absent from this line (wrapped prefix); use the known name.
        names.push(level.known);
      } else if (tokens.length > 1) {
        names.push(tokens.shift());
        level.map.set(level.key, names[names.length - 1]);
      } else {
        ok = false;
        break;
      }
    }

    const village = tokens.join(" ").trim();
    if (!ok || !village) {
      unrecovered.push(line);
      continue;
    }

    recovered.push({
      province,
      district: names[0],
      sector: names[1],
      cell: names[2],
      village,
      villageCode,
      nep,
    });
  }

  return { recovered, unrecovered };
}

/**
 * The PDF occasionally prints a row with a variant or wrong ancestor name
 * ("Mageragere Mwendo" in the middle of "Mageregere Mataba" rows). The NISR
 * code is the authoritative key, so every row gets the majority name used for
 * its code prefix. Ties break lexicographically for determinism.
 */
function reconcileNames(rows) {
  const levels = [
    { length: 1, field: "province" },
    { length: 2, field: "district" },
    { length: 4, field: "sector" },
    { length: 6, field: "cell" },
  ];
  let changed = 0;

  for (const { length, field } of levels) {
    const tally = new Map();
    for (const row of rows) {
      const prefix = row.villageCode.slice(0, length);
      let names = tally.get(prefix);
      if (!names) tally.set(prefix, (names = new Map()));
      names.set(row[field], (names.get(row[field]) || 0) + 1);
    }

    const majority = new Map();
    for (const [prefix, names] of tally) {
      const best = [...names.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
      majority.set(prefix, best);
    }

    for (const row of rows) {
      const best = majority.get(row.villageCode.slice(0, length));
      if (row[field] !== best) {
        row[field] = best;
        changed += 1;
      }
    }
  }

  return changed;
}

function buildTree(rows) {
  const root = {
    country: "Rwanda",
    version: "1.0.0",
    // Snapshot date of the administrative structure (from the source PDF's
    // creation date). Bump when rebuilding from a newer NISR release, and
    // record id changes in data/changes.json.
    dataVersion: "2019-07",
    source:
      "National Institute of Statistics of Rwanda (NISR) — List of Villages " +
      "(List_of_Villages_for_all_technology.pdf, created 2019-07-03)",
    sourceDate: "2019-07-03",
    license: "CC-BY-4.0",
    codeStandard:
      "code fields follow NISR administrative codes; provinces additionally carry ISO 3166-2:RW codes",
    provinces: [],
  };

  const provinceMap = new Map();
  const seenVillageIds = new Set();
  let added = 0;
  let duplicates = 0;

  for (const row of rows) {
    const provinceId = `province-${slug(row.province)}`;
    const districtId = `${provinceId}-district-${slug(row.district)}`;
    const sectorId = `${districtId}-sector-${slug(row.sector)}`;
    const cellId = `${sectorId}-cell-${slug(row.cell)}`;
    const villageId = `village-${row.villageCode}`;

    if (seenVillageIds.has(villageId)) {
      duplicates += 1;
      continue;
    }
    seenVillageIds.add(villageId);

    let provinceObj = provinceMap.get(provinceId);
    if (!provinceObj) {
      provinceObj = { id: provinceId, name: row.province, districts: [], _map: new Map() };
      provinceMap.set(provinceId, provinceObj);
    }

    let districtObj = provinceObj._map.get(districtId);
    if (!districtObj) {
      districtObj = { id: districtId, name: row.district, sectors: [], _map: new Map() };
      provinceObj._map.set(districtId, districtObj);
      provinceObj.districts.push(districtObj);
    }

    let sectorObj = districtObj._map.get(sectorId);
    if (!sectorObj) {
      sectorObj = { id: sectorId, name: row.sector, cells: [], _map: new Map() };
      districtObj._map.set(sectorId, sectorObj);
      districtObj.sectors.push(sectorObj);
    }

    let cellObj = sectorObj._map.get(cellId);
    if (!cellObj) {
      cellObj = { id: cellId, name: row.cell, villages: [] };
      sectorObj._map.set(cellId, cellObj);
      sectorObj.cells.push(cellObj);
    }

    cellObj.villages.push({ id: villageId, name: row.village, nep: row.nep });
    added += 1;
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
        cells: sector.cells,
      })),
    })),
  }));

  return { root, added, duplicates };
}

function main() {
  const text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });
  const lines = text.split(/\r?\n/);

  const { rows, deferred } = parseLines(lines);
  const { recovered, unrecovered } = recoverDeferred(deferred, rows);
  const allRows = rows.concat(recovered);
  const reconciled = reconcileNames(allRows);

  const { root, added, duplicates } = buildTree(allRows);

  // Guard against silent data loss: every village code that appears in the
  // PDF next to an NEP value must end up in the dataset.
  const expected = new Set();
  const codeInText = new RegExp(`\\b([0-9]{8,10})\\s+(?:${NEP_VALUES.join("|")})\\b`, "g");
  for (const match of collapseAll(text).matchAll(codeInText)) {
    expected.add(match[1]);
  }
  const built = new Set(allRows.map((row) => row.villageCode));
  const missing = [...expected].filter((code) => !built.has(code));

  console.log(`Parsed rows: ${rows.length} (+${recovered.length} recovered)`);
  console.log(`Ancestor names reconciled by code: ${reconciled}`);
  console.log(`Duplicate codes collapsed: ${duplicates}`);
  console.log(`Villages: ${added}`);
  console.log(`Provinces: ${root.provinces.length}`);

  if (unrecovered.length > 0) {
    console.error(`Unrecovered lines (${unrecovered.length}):`);
    for (const line of unrecovered.slice(0, 20)) console.error(`  ${line}`);
  }
  if (missing.length > 0) {
    console.error(`MISSING ${missing.length} village codes present in the PDF:`);
    for (const code of missing.slice(0, 20)) console.error(`  ${code}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(root, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outputPath}`);
}

function collapseAll(text) {
  return text
    .split(/\r?\n/)
    .map((line) => collapse(line))
    .join("\n");
}

main();
