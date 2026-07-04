const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  getDataset,
  getProvinces,
  getDistrictsByProvinceId,
  getSectorsByDistrictId,
  getCellsBySectorId,
  getVillagesByCellId,
  loadDataset,
} = require("../src/index");

test("dataset has root metadata and 5 provinces", () => {
  const dataset = getDataset();
  assert.equal(dataset.country, "Rwanda");
  assert.ok(dataset.version);
  assert.equal(dataset.provinces.length, 5);
});

test("getProvinces returns provinces with ids and names", () => {
  const provinces = getProvinces();
  assert.equal(provinces.length, 5);
  for (const province of provinces) {
    assert.ok(province.id);
    assert.ok(province.name);
    assert.ok(Array.isArray(province.districts));
  }
});

test("dataset is deep-frozen", () => {
  const dataset = getDataset();
  assert.ok(Object.isFrozen(dataset));
  assert.ok(Object.isFrozen(dataset.provinces[0]));
  assert.throws(() => {
    "use strict";
    dataset.provinces[0].name = "tampered";
  });
});

test("hierarchy lookups traverse province -> village", () => {
  const [province] = getProvinces();
  const districts = getDistrictsByProvinceId(province.id);
  assert.ok(districts.length > 0);

  const sectors = getSectorsByDistrictId(districts[0].id);
  assert.ok(sectors.length > 0);

  const cells = getCellsBySectorId(sectors[0].id);
  assert.ok(cells.length > 0);

  const villages = getVillagesByCellId(cells[0].id);
  assert.ok(villages.length > 0);
  assert.ok(villages[0].id);
  assert.ok(villages[0].name);
});

test("unknown ids return null", () => {
  assert.equal(getDistrictsByProvinceId("no-such-province"), null);
  assert.equal(getSectorsByDistrictId("no-such-district"), null);
  assert.equal(getCellsBySectorId("no-such-sector"), null);
  assert.equal(getVillagesByCellId("no-such-cell"), null);
});

test("loadDataset caches and indexes every level", () => {
  const first = loadDataset();
  const second = loadDataset();
  assert.equal(first, second);
  assert.equal(first.index.provinces.size, 5);
  assert.ok(first.index.districts.size > 0);
  assert.ok(first.index.sectors.size > 0);
  assert.ok(first.index.cells.size > 0);
});
