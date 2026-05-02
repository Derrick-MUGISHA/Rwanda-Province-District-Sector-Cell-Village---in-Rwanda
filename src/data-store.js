const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "rwanda-administrative.json");

let cache = null;

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze(value[key]);
    }
  }
  return value;
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
  };

  for (const province of dataset.provinces) {
    index.provinces.set(province.id, province);

    for (const district of province.districts) {
      index.districts.set(district.id, district);

      for (const sector of district.sectors) {
        index.sectors.set(sector.id, sector);

        for (const cell of sector.cells) {
          index.cells.set(cell.id, cell);
        }
      }
    }
  }

  cache = { dataset: deepFreeze(dataset), index };
  return cache;
}

module.exports = {
  loadDataset,
};
