const { loadDataset } = require("./data-store");

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

module.exports = {
  getDataset,
  getProvinces,
  getDistrictsByProvinceId,
  getSectorsByDistrictId,
  getCellsBySectorId,
  getVillagesByCellId,
  loadDataset,
};
