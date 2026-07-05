const { loadDataset, normalizeText, LEVELS } = require("./data-store");

function getDataset() {
  const { dataset } = loadDataset();
  return dataset;
}

function getProvinces() {
  return getDataset().provinces;
}

function getDistrictsByProvinceId(provinceId) {
  const { index } = loadDataset();
  const province = index.provinces.get(provinceId);
  return province ? province.districts : null;
}

function getSectorsByDistrictId(districtId) {
  const { index } = loadDataset();
  const district = index.districts.get(districtId);
  return district ? district.sectors : null;
}

function getCellsBySectorId(sectorId) {
  const { index } = loadDataset();
  const sector = index.sectors.get(sectorId);
  return sector ? sector.cells : null;
}

function getVillagesByCellId(cellId) {
  const { index } = loadDataset();
  const cell = index.cells.get(cellId);
  return cell ? cell.villages : null;
}

function getDataMeta() {
  const { dataset, index } = loadDataset();
  return {
    country: dataset.country,
    version: dataset.version,
    dataVersion: dataset.dataVersion,
    source: dataset.source,
    sourceDate: dataset.sourceDate,
    license: dataset.license,
    codeStandard: dataset.codeStandard,
    counts: {
      provinces: index.provinces.size,
      districts: index.districts.size,
      sectors: index.sectors.size,
      cells: index.cells.size,
      villages: index.villages.size,
    },
  };
}

function getAllDistricts() {
  return Array.from(loadDataset().index.districts.values());
}

function getAllSectors() {
  return Array.from(loadDataset().index.sectors.values());
}

function getAllCells() {
  return Array.from(loadDataset().index.cells.values());
}

function getAllVillages() {
  return Array.from(loadDataset().index.villages.values());
}

function getById(id) {
  const { index } = loadDataset();
  const meta = index.nodes.get(String(id));
  return meta ? { level: meta.level, item: meta.node } : null;
}

function getByCode(code) {
  const { index } = loadDataset();
  const entry = index.byCode.get(String(code).trim().toUpperCase());
  if (!entry) {
    return null;
  }
  const meta = index.nodes.get(entry.id);
  return { level: meta.level, item: meta.node };
}

function summarize(node, level) {
  const summary = { level, id: node.id, name: node.name, code: node.code };
  if (level === "province") {
    summary.isoCode = node.isoCode;
  }
  return summary;
}

function getPath(id) {
  const { index } = loadDataset();
  let meta = index.nodes.get(String(id));
  if (!meta) {
    return null;
  }
  const path = {};
  while (meta) {
    path[meta.level] = summarize(meta.node, meta.level);
    meta = meta.parentId ? index.nodes.get(meta.parentId) : null;
  }
  return path;
}

/**
 * Bounded Levenshtein distance; returns max + 1 as soon as the distance is
 * guaranteed to exceed max.
 */
function levenshtein(a, b, max) {
  if (Math.abs(a.length - b.length) > max) {
    return max + 1;
  }
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution);
      if (current[j] < rowMin) {
        rowMin = current[j];
      }
    }
    if (rowMin > max) {
      return max + 1;
    }
    previous = current;
  }
  return previous[b.length];
}

function search(query, options = {}) {
  const { index } = loadDataset();
  const normalizedQuery = normalizeText(query || "");
  if (!normalizedQuery) {
    return [];
  }

  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : 20;
  const fuzzy = options.fuzzy !== false;
  let levelFilter = null;
  if (options.levels) {
    for (const level of options.levels) {
      if (!LEVELS.includes(level)) {
        throw new RangeError(`Unknown level "${level}". Expected one of: ${LEVELS.join(", ")}`);
      }
    }
    levelFilter = new Set(options.levels);
  }

  const maxDistance = normalizedQuery.length >= 7 ? 2 : 1;
  const bestById = new Map();

  for (const entry of index.searchEntries) {
    if (levelFilter && !levelFilter.has(entry.level)) {
      continue;
    }

    let score = 0;
    if (entry.normalized === normalizedQuery) {
      score = 1;
    } else if (entry.normalized.startsWith(normalizedQuery)) {
      score = 0.9;
    } else if (entry.normalized.includes(normalizedQuery)) {
      score = 0.7;
    } else if (fuzzy && normalizedQuery.length >= 3) {
      const distance = levenshtein(entry.normalized, normalizedQuery, maxDistance);
      if (distance <= maxDistance) {
        score = 0.6 - distance * 0.1;
      }
    }

    if (score === 0) {
      continue;
    }
    const existing = bestById.get(entry.id);
    if (!existing || score > existing.score) {
      bestById.set(entry.id, { entry, score });
    }
  }

  const levelRank = new Map(LEVELS.map((level, i) => [level, i]));
  return Array.from(bestById.values())
    .sort(
      (a, b) =>
        b.score - a.score ||
        levelRank.get(a.entry.level) - levelRank.get(b.entry.level) ||
        a.entry.name.localeCompare(b.entry.name),
    )
    .slice(0, limit)
    .map(({ entry, score }) => {
      const node = index.nodes.get(entry.id).node;
      return { ...summarize(node, entry.level), matchedName: entry.name, score, path: getPath(entry.id) };
    });
}

/**
 * Resolves a user-supplied value (id, NISR/ISO code, or name) to the ids of
 * matching nodes at the given level. Names are matched case- and
 * diacritic-insensitively and may resolve to several nodes.
 */
function resolveCandidates(index, level, value) {
  const raw = String(value).trim();

  const byId = index.nodes.get(raw);
  if (byId && byId.level === level) {
    return [raw];
  }

  const byCode = index.byCode.get(raw.toUpperCase());
  if (byCode && byCode.level === level) {
    return [byCode.id];
  }

  const byName = index.namesByLevel.get(level).get(normalizeText(raw));
  return byName ? byName : [];
}

function validateHierarchy(parts) {
  const { index } = loadDataset();
  const errors = [];

  const provided = LEVELS.filter(
    (level) => parts && parts[level] != null && String(parts[level]).trim() !== "",
  );
  if (provided.length === 0) {
    return { valid: false, errors: [`Provide at least one of: ${LEVELS.join(", ")}.`], match: null };
  }

  const candidates = {};
  for (const level of provided) {
    candidates[level] = new Set(resolveCandidates(index, level, parts[level]));
    if (candidates[level].size === 0) {
      errors.push(`Unknown ${level}: "${parts[level]}"`);
    }
  }
  if (errors.length > 0) {
    return { valid: false, errors, match: null };
  }

  // Names can be ambiguous (village names repeat across the country), so the
  // hierarchy is valid if any candidate of the deepest level has an ancestor
  // chain that satisfies every other provided level.
  const deepest = provided[provided.length - 1];
  for (const candidateId of candidates[deepest]) {
    const path = getPath(candidateId);
    const matchesAll = provided.every(
      (level) => path[level] && candidates[level].has(path[level].id),
    );
    if (matchesAll) {
      return { valid: true, errors: [], match: path };
    }
  }

  return {
    valid: false,
    errors: [`The provided levels (${provided.join(", ")}) do not form a valid chain.`],
    match: null,
  };
}

function isValidHierarchy(parts) {
  return validateHierarchy(parts).valid;
}

let idChangesCache = null;

function getIdChanges() {
  if (!idChangesCache) {
    idChangesCache = require("../data/changes.json").changes;
  }
  return idChangesCache;
}

/**
 * Resolves an id from any previous dataset version to the current one by
 * following the migration map in data/changes.json. Returns the id unchanged
 * when it still exists, the current replacement when it was migrated, and
 * null when it is unknown.
 */
function resolveId(id) {
  const { index } = loadDataset();
  let current = String(id);
  const seen = new Set();

  while (!index.nodes.has(current)) {
    if (seen.has(current)) {
      return null;
    }
    seen.add(current);
    const change = getIdChanges().find((entry) => entry.oldId === current);
    if (!change) {
      return null;
    }
    current = change.newId;
  }
  return current;
}

module.exports = {
  getDataset,
  getDataMeta,
  getProvinces,
  getDistrictsByProvinceId,
  getSectorsByDistrictId,
  getCellsBySectorId,
  getVillagesByCellId,
  getAllDistricts,
  getAllSectors,
  getAllCells,
  getAllVillages,
  getById,
  getByCode,
  getPath,
  search,
  validateHierarchy,
  isValidHierarchy,
  resolveId,
  getIdChanges,
  loadDataset,
};
