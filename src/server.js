const express = require("express");
const { loadDataset } = require("./data-store");

const app = express();
const port = process.env.PORT || 3000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/dataset", (_req, res) => {
  const { dataset } = loadDataset();
  res.json(dataset);
});

app.get("/api/provinces", (_req, res) => {
  const { dataset } = loadDataset();
  res.json(dataset.provinces);
});

app.get("/api/provinces/:provinceId/districts", (req, res) => {
  const { index } = loadDataset();
  const province = index.provinces.get(req.params.provinceId);

  if (!province) {
    return res.status(404).json({ error: "Province not found" });
  }

  return res.json(province.districts);
});

app.get("/api/districts/:districtId/sectors", (req, res) => {
  const { index } = loadDataset();
  const district = index.districts.get(req.params.districtId);

  if (!district) {
    return res.status(404).json({ error: "District not found" });
  }

  return res.json(district.sectors);
});

app.get("/api/sectors/:sectorId/cells", (req, res) => {
  const { index } = loadDataset();
  const sector = index.sectors.get(req.params.sectorId);

  if (!sector) {
    return res.status(404).json({ error: "Sector not found" });
  }

  return res.json(sector.cells);
});

app.get("/api/cells/:cellId/villages", (req, res) => {
  const { index } = loadDataset();
  const cell = index.cells.get(req.params.cellId);

  if (!cell) {
    return res.status(404).json({ error: "Cell not found" });
  }

  return res.json(cell.villages);
});

app.listen(port, () => {
  console.log(`Rwanda administrative API listening on port ${port}`);
});
