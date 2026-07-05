// Splits the canonical dataset into one JSON file per province so browser and
// serverless consumers can lazy-load a slice instead of the full ~3 MB file:
//   require("@derrick63/rwanda-admin-hierarchy/data/provinces/umujyi-wa-kigali.json")
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const dataFile = path.join(repoRoot, "data", "rwanda-administrative.json");
const outDir = path.join(repoRoot, "data", "provinces");

const dataset = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const { provinces, ...meta } = dataset;

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const index = [];
for (const province of provinces) {
  const slug = province.id.replace(/^province-/, "");
  const file = `${slug}.json`;
  fs.writeFileSync(
    path.join(outDir, file),
    JSON.stringify({ ...meta, provinces: [province] }, null, 2) + "\n",
    "utf8",
  );
  index.push({ id: province.id, name: province.name, file });
  console.log(`Wrote data/provinces/${file}`);
}

fs.writeFileSync(
  path.join(outDir, "index.json"),
  JSON.stringify({ ...meta, provinces: index }, null, 2) + "\n",
  "utf8",
);
console.log("Wrote data/provinces/index.json");
