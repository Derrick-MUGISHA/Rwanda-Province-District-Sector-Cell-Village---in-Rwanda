const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const canonical = path.join(repoRoot, "data", "rwanda-administrative.json");

// Copies of the canonical dataset bundled by the other language packages.
// (The Java package copies straight from data/ at build time via Maven.)
const copies = [
  path.join(repoRoot, "python", "rwanda_admin_hierarchy", "rwanda_administrative.json"),
  path.join(repoRoot, "dart", "lib", "src", "rwanda_administrative.json"),
];

const checkOnly = process.argv.includes("--check");
const source = fs.readFileSync(canonical);
let outOfSync = 0;

for (const copy of copies) {
  if (!fs.existsSync(path.dirname(copy))) {
    continue;
  }
  const same = fs.existsSync(copy) && fs.readFileSync(copy).equals(source);
  if (same) {
    console.log(`In sync: ${path.relative(repoRoot, copy)}`);
  } else if (checkOnly) {
    console.error(`OUT OF SYNC: ${path.relative(repoRoot, copy)} (run: npm run sync:data)`);
    outOfSync += 1;
  } else {
    fs.writeFileSync(copy, source);
    console.log(`Updated: ${path.relative(repoRoot, copy)}`);
  }
}

if (outOfSync > 0) {
  process.exit(1);
}
