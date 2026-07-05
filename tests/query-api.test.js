const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  getProvinces,
  getAllDistricts,
  resolveId,
  getIdChanges,
  getAllSectors,
  getAllCells,
  getAllVillages,
  getById,
  getByCode,
  getPath,
  search,
  validateHierarchy,
  isValidHierarchy,
} = require("../src/index");

test("provinces carry NISR codes, ISO 3166-2 codes and name variants", () => {
  const provinces = getProvinces();
  const byName = new Map(provinces.map((p) => [p.name, p]));

  const kigali = byName.get("Umujyi wa Kigali");
  assert.equal(kigali.code, "1");
  assert.equal(kigali.isoCode, "RW-01");
  assert.ok(kigali.nameVariants.includes("City of Kigali"));

  assert.equal(byName.get("Amajyepfo").isoCode, "RW-05");
  assert.equal(byName.get("Iburengerazuba").isoCode, "RW-04");
  assert.equal(byName.get("Amajyaruguru").isoCode, "RW-03");
  assert.equal(byName.get("Iburasirazuba").isoCode, "RW-02");
});

test("NISR codes are derived at every level", () => {
  const path = getPath("village-11010103");
  assert.equal(path.village.code, "11010103");
  assert.equal(path.cell.code, "110101");
  assert.equal(path.sector.code, "1101");
  assert.equal(path.district.code, "11");
  assert.equal(path.province.code, "1");
});

test("flat accessors return every node of a level", () => {
  assert.equal(getAllDistricts().length, 30);
  // Official structure: 416 sectors; the source PDF merges a few cells and
  // omits ~21 of the official 14,837 villages.
  assert.equal(getAllSectors().length, 416);
  assert.ok(getAllCells().length > 2100);
  assert.equal(getAllVillages().length, 14816);
});

test("villages carry their NEP electrification category", () => {
  const seen = new Set(getAllVillages().map((v) => v.nep));
  assert.deepEqual([...seen].sort(), ["GE", "Microgrid", "SAS"]);
});

test("getById resolves ids at any level", () => {
  const village = getById("village-11010103");
  assert.equal(village.level, "village");
  assert.equal(village.item.name, "Iterambere");

  const district = getById("province-umujyi-wa-kigali-district-nyarugenge");
  assert.equal(district.level, "district");
  assert.equal(district.item.name, "Nyarugenge");

  assert.equal(getById("no-such-id"), null);
});

test("getByCode resolves NISR and ISO codes", () => {
  assert.equal(getByCode("RW-01").item.name, "Umujyi wa Kigali");
  assert.equal(getByCode("rw-05").item.name, "Amajyepfo");
  assert.equal(getByCode(11).item.name, "Nyarugenge");
  assert.equal(getByCode("1101").item.name, "Gitega");
  assert.equal(getByCode("11010103").item.name, "Iterambere");
  assert.equal(getByCode("99999999"), null);
});

test("getPath returns the full ancestry of a village", () => {
  const path = getPath("village-11010103");
  assert.equal(path.province.name, "Umujyi wa Kigali");
  assert.equal(path.district.name, "Nyarugenge");
  assert.equal(path.sector.name, "Gitega");
  assert.equal(path.cell.name, "Akabahizi");
  assert.equal(path.village.name, "Iterambere");
});

test("getPath works for intermediate levels and unknown ids", () => {
  const path = getPath("province-umujyi-wa-kigali-district-nyarugenge-sector-gitega");
  assert.equal(path.sector.name, "Gitega");
  assert.equal(path.district.name, "Nyarugenge");
  assert.equal(path.village, undefined);
  assert.equal(getPath("no-such-id"), null);
});

test("search finds exact names across levels with paths", () => {
  const results = search("Gitega");
  assert.ok(results.length > 0);
  assert.equal(results[0].score, 1);
  assert.ok(results.some((r) => r.level === "sector" && r.path.district.name === "Nyarugenge"));
});

test("search is case- and diacritic-insensitive", () => {
  const plain = search("gitega");
  const accented = search("GÍTEGA");
  assert.deepEqual(
    accented.map((r) => r.id),
    plain.map((r) => r.id),
  );
});

test("search tolerates misspellings", () => {
  const results = search("Gitegga");
  assert.ok(results.some((r) => r.name === "Gitega"));
});

test("search respects level filter and limit", () => {
  const results = search("kigali", { levels: ["province"], limit: 1 });
  assert.equal(results.length, 1);
  assert.equal(results[0].level, "province");
  assert.equal(results[0].isoCode, "RW-01");

  assert.throws(() => search("kigali", { levels: ["country"] }), RangeError);
});

test("search matches province name variants", () => {
  const results = search("Southern Province", { levels: ["province"] });
  assert.equal(results[0].name, "Amajyepfo");
  assert.equal(results[0].matchedName, "Southern Province");
});

test("search returns [] for empty queries", () => {
  assert.deepEqual(search(""), []);
  assert.deepEqual(search("   "), []);
});

test("isValidHierarchy accepts a correct chain by names", () => {
  assert.equal(
    isValidHierarchy({
      province: "Umujyi wa Kigali",
      district: "Nyarugenge",
      sector: "Gitega",
      cell: "Akabahizi",
      village: "Iterambere",
    }),
    true,
  );
});

test("isValidHierarchy accepts mixed ids, codes and variant names", () => {
  assert.equal(
    isValidHierarchy({
      province: "RW-01",
      district: "11",
      sector: "province-umujyi-wa-kigali-district-nyarugenge-sector-gitega",
      village: "11010103",
    }),
    true,
  );
  assert.equal(isValidHierarchy({ province: "Kigali", district: "Nyarugenge" }), true);
});

test("isValidHierarchy resolves ambiguous village names via the parent chain", () => {
  // Many villages are named "Ubumwe"; only the chain disambiguates them.
  assert.equal(isValidHierarchy({ cell: "Akabahizi", village: "Ubumwe" }), true);
});

test("validateHierarchy rejects broken chains and unknown values", () => {
  const wrongChain = validateHierarchy({ province: "Amajyepfo", district: "Nyarugenge" });
  assert.equal(wrongChain.valid, false);
  assert.ok(wrongChain.errors.length > 0);

  const unknown = validateHierarchy({ district: "Atlantis" });
  assert.equal(unknown.valid, false);
  assert.match(unknown.errors[0], /Unknown district/);

  const empty = validateHierarchy({});
  assert.equal(empty.valid, false);
});

test("resolveId migrates ids from previous dataset versions", () => {
  // Unchanged ids resolve to themselves.
  assert.equal(resolveId("village-11010103"), "village-11010103");
  // Ids removed in 1.1.0 resolve to their replacements.
  assert.equal(
    resolveId("province-umujyi-wa-kigali-district-nyarugenge-sector-mageragere"),
    "province-umujyi-wa-kigali-district-nyarugenge-sector-mageregere",
  );
  assert.equal(
    resolveId("province-iburasirazuba-district-kirehe-sector-mahama-cell-umunini"),
    "province-iburasirazuba-district-kirehe-sector-mahama-cell-munini",
  );
  assert.equal(resolveId("no-such-id"), null);
});

test("getIdChanges exposes the migration history", () => {
  const changes = getIdChanges();
  assert.ok(changes.length >= 3);
  for (const change of changes) {
    assert.ok(change.oldId);
    assert.ok(change.reason);
    assert.ok(change.sinceVersion);
  }
});

test("validateHierarchy returns the resolved chain on success", () => {
  const result = validateHierarchy({ sector: "Gitega", district: "Nyarugenge" });
  assert.equal(result.valid, true);
  assert.equal(result.match.province.isoCode, "RW-01");
  assert.equal(result.match.sector.code, "1101");
});
