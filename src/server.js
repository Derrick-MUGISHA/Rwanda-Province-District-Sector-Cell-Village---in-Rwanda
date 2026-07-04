let cors, express, helmet, rateLimit;
try {
  require("dotenv").config();
  cors = require("cors");
  express = require("express");
  helmet = require("helmet");
  rateLimit = require("express-rate-limit");
} catch (error) {
  console.error(
    "The API server requires dev dependencies. Run `npm install` inside the repository.\n" +
      "The published package's lookup API (require(\"@derrick63/rwanda-admin-hierarchy\")) has no dependencies.",
  );
  throw error;
}

const { loadDataset } = require("./data-store");

const app = express();
const port = Number(process.env.PORT) || 3000;
const fullDatasetEnabled = process.env.ENABLE_FULL_DATASET_ENDPOINT === "true";
const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120);
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const idPattern = /^[a-z0-9-]{3,150}$/;

app.disable("x-powered-by");
// Required for accurate client IPs (and rate limiting) behind a reverse proxy.
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : Number(process.env.TRUST_PROXY));
}
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS policy."));
    },
  }),
);
app.use(
  rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

function isValidId(value) {
  return idPattern.test(value);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/dataset", (_req, res) => {
  if (!fullDatasetEnabled) {
    return res
      .status(403)
      .json({ error: "Full dataset endpoint is disabled. Set ENABLE_FULL_DATASET_ENDPOINT=true." });
  }
  const { dataset } = loadDataset();
  return res.json(dataset);
});

app.get("/api/provinces", (_req, res) => {
  const { dataset } = loadDataset();
  return res.json(dataset.provinces);
});

app.get("/api/provinces/:provinceId/districts", (req, res) => {
  if (!isValidId(req.params.provinceId)) {
    return res.status(400).json({ error: "Invalid province ID format" });
  }
  const { index } = loadDataset();
  const province = index.provinces.get(req.params.provinceId);

  if (!province) {
    return res.status(404).json({ error: "Province not found" });
  }

  return res.json(province.districts);
});

app.get("/api/districts/:districtId/sectors", (req, res) => {
  if (!isValidId(req.params.districtId)) {
    return res.status(400).json({ error: "Invalid district ID format" });
  }
  const { index } = loadDataset();
  const district = index.districts.get(req.params.districtId);

  if (!district) {
    return res.status(404).json({ error: "District not found" });
  }

  return res.json(district.sectors);
});

app.get("/api/sectors/:sectorId/cells", (req, res) => {
  if (!isValidId(req.params.sectorId)) {
    return res.status(400).json({ error: "Invalid sector ID format" });
  }
  const { index } = loadDataset();
  const sector = index.sectors.get(req.params.sectorId);

  if (!sector) {
    return res.status(404).json({ error: "Sector not found" });
  }

  return res.json(sector.cells);
});

app.get("/api/cells/:cellId/villages", (req, res) => {
  if (!isValidId(req.params.cellId)) {
    return res.status(400).json({ error: "Invalid cell ID format" });
  }
  const { index } = loadDataset();
  const cell = index.cells.get(req.params.cellId);

  if (!cell) {
    return res.status(404).json({ error: "Cell not found" });
  }

  return res.json(cell.villages);
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  if (err && err.message === "Origin not allowed by CORS policy.") {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(port, () => {
  console.log(`Rwanda administrative API listening on port ${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
