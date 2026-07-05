const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "rwanda-administrative.json");

const LEVELS = ["province", "district", "sector", "cell", "village"];

// NISR numeric code lengths per level. A village id such as village-11010103
// encodes the full chain: province 1, district 11, sector 1101, cell 110101.
const CODE_LENGTHS = {
  province: 1,
  district: 2,
  sector: 4,
  cell: 6,
  village: 8,
};

// ISO 3166-2:RW codes and common English/French name variants, keyed by the
// NISR province code derived from the village codes.
const PROVINCE_META = {
  1: { isoCode: "RW-01", nameVariants: ["City of Kigali", "Kigali City", "Kigali", "Ville de Kigali"] },
  2: { isoCode: "RW-05", nameVariants: ["Southern Province", "South", "Sud"] },
  3: { isoCode: "RW-04", nameVariants: ["Western Province", "West", "Ouest"] },
  4: { isoCode: "RW-03", nameVariants: ["Northern Province", "North", "Nord"] },
  5: { isoCode: "RW-02", nameVariants: ["Eastern Province", "East", "Est"] },
};

const VILLAGE_ID_PATTERN = /^village-(\d{8})$/;

let cache = null;

/** Lowercases, strips diacritics and punctuation, and collapses whitespace. */
function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze(value[key]);
    }
  }
  return value;
}

/**
 * Returns the shared prefix of the given length when it is unambiguous,
 * otherwise null. A handful of cells in the source PDF merge what NISR tracks
 * as "I"/"II" cell pairs (e.g. Munanira I/II), so their villages span two
 * official cell codes and no single code can be assigned.
 */
function uniquePrefix(codes, length) {
  let prefix = null;
  for (const code of codes) {
    const candidate = code.slice(0, length);
    if (prefix === null) {
      prefix = candidate;
    } else if (prefix !== candidate) {
      return null;
    }
  }
  return prefix;
}

function loadDataset() {
  if (cache) {
    return cache;
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const dataset = JSON.parse(raw);

  const index = {
    provinces: new Map(),
    districts: new Map(),
    sectors: new Map(),
    cells: new Map(),
    villages: new Map(),
    // id -> { level, node, parentId }
    nodes: new Map(),
    // NISR code (string) or ISO 3166-2 code -> { level, id }
    byCode: new Map(),
    // level -> Map(normalized name -> [ids]) — names repeat, especially villages.
    namesByLevel: new Map(LEVELS.map((level) => [level, new Map()])),
    // Flat list scanned by search(): { id, level, name, normalized }
    searchEntries: [],
  };

  const register = (level, node, parentId) => {
    index[`${level}s`].set(node.id, node);
    index.nodes.set(node.id, { level, node, parentId });

    const names = [node.name, ...(node.nameVariants || [])];
    for (const name of names) {
      const normalized = normalizeText(name);
      if (!normalized) continue;
      index.searchEntries.push({ id: node.id, level, name, normalized });
      const byName = index.namesByLevel.get(level);
      const ids = byName.get(normalized);
      if (ids) {
        if (!ids.includes(node.id)) ids.push(node.id);
      } else {
        byName.set(normalized, [node.id]);
      }
    }
  };

  const registerCode = (level, node) => {
    if (node.code) {
      index.byCode.set(node.code, { level, id: node.id });
    }
    if (node.isoCode) {
      index.byCode.set(node.isoCode, { level, id: node.id });
    }
  };

  for (const province of dataset.provinces) {
    const provinceCodes = [];

    for (const district of province.districts) {
      const districtCodes = [];

      for (const sector of district.sectors) {
        const sectorCodes = [];

        for (const cell of sector.cells) {
          const cellCodes = [];

          for (const village of cell.villages) {
            const match = VILLAGE_ID_PATTERN.exec(village.id);
            village.code = match ? match[1] : null;
            if (village.code) cellCodes.push(village.code);
            register("village", village, cell.id);
            registerCode("village", village);
          }

          cell.code = uniquePrefix(cellCodes, CODE_LENGTHS.cell);
          sectorCodes.push(...cellCodes);
          register("cell", cell, sector.id);
          registerCode("cell", cell);
        }

        sector.code = uniquePrefix(sectorCodes, CODE_LENGTHS.sector);
        districtCodes.push(...sectorCodes);
        register("sector", sector, district.id);
        registerCode("sector", sector);
      }

      district.code = uniquePrefix(districtCodes, CODE_LENGTHS.district);
      provinceCodes.push(...districtCodes);
      register("district", district, province.id);
      registerCode("district", district);
    }

    province.code = uniquePrefix(provinceCodes, CODE_LENGTHS.province);
    const meta = PROVINCE_META[province.code];
    province.isoCode = meta ? meta.isoCode : null;
    province.nameVariants = meta ? meta.nameVariants : [];
    register("province", province, null);
    registerCode("province", province);
  }

  cache = { dataset: deepFreeze(dataset), index };
  return cache;
}

module.exports = {
  loadDataset,
  normalizeText,
  LEVELS,
};
