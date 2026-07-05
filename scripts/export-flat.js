// Generates flat exports for non-JS consumers (analysts, GIS, spreadsheets):
//   exports/villages.csv   one denormalized row per village
//   exports/rwanda.sql     portable schema + inserts (SQLite/Postgres/MySQL)
//   exports/rwanda.sqlite  ready-to-query SQLite database (needs sqlite3 CLI)
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { loadDataset } = require("../src/data-store");

const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "exports");

function csvField(value) {
  if (value == null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function sqlString(value) {
  return value == null ? "NULL" : `'${String(value).replace(/'/g, "''")}'`;
}

function main() {
  const { dataset } = loadDataset();
  fs.mkdirSync(outDir, { recursive: true });

  const csvRows = [
    [
      "province_code", "province_iso", "province", "district_code", "district",
      "sector_code", "sector", "cell_code", "cell",
      "village_code", "village", "village_id", "nep",
    ].join(","),
  ];

  const sql = [
    "-- Rwanda administrative hierarchy — generated from data/rwanda-administrative.json",
    `-- dataVersion ${dataset.dataVersion}; source: ${dataset.source}`,
    `-- license: ${dataset.license}`,
    "BEGIN;",
    // ids are the primary keys: a handful of merged cells have no NISR code
    // (NULL), which strict databases reject in primary key columns.
    "CREATE TABLE provinces (id TEXT PRIMARY KEY, code TEXT, iso_code TEXT, name TEXT NOT NULL);",
    "CREATE TABLE districts (id TEXT PRIMARY KEY, code TEXT, name TEXT NOT NULL, province_id TEXT NOT NULL REFERENCES provinces(id));",
    "CREATE TABLE sectors (id TEXT PRIMARY KEY, code TEXT, name TEXT NOT NULL, district_id TEXT NOT NULL REFERENCES districts(id));",
    "CREATE TABLE cells (id TEXT PRIMARY KEY, code TEXT, name TEXT NOT NULL, sector_id TEXT NOT NULL REFERENCES sectors(id));",
    "CREATE TABLE villages (id TEXT PRIMARY KEY, code TEXT, name TEXT NOT NULL, nep TEXT, cell_id TEXT NOT NULL REFERENCES cells(id));",
  ];

  for (const province of dataset.provinces) {
    sql.push(
      `INSERT INTO provinces VALUES (${sqlString(province.id)}, ${sqlString(province.code)}, ${sqlString(province.isoCode)}, ${sqlString(province.name)});`,
    );
    for (const district of province.districts) {
      sql.push(
        `INSERT INTO districts VALUES (${sqlString(district.id)}, ${sqlString(district.code)}, ${sqlString(district.name)}, ${sqlString(province.id)});`,
      );
      for (const sector of district.sectors) {
        sql.push(
          `INSERT INTO sectors VALUES (${sqlString(sector.id)}, ${sqlString(sector.code)}, ${sqlString(sector.name)}, ${sqlString(district.id)});`,
        );
        for (const cell of sector.cells) {
          sql.push(
            `INSERT INTO cells VALUES (${sqlString(cell.id)}, ${sqlString(cell.code)}, ${sqlString(cell.name)}, ${sqlString(sector.id)});`,
          );
          for (const village of cell.villages) {
            sql.push(
              `INSERT INTO villages VALUES (${sqlString(village.id)}, ${sqlString(village.code)}, ${sqlString(village.name)}, ${sqlString(village.nep)}, ${sqlString(cell.id)});`,
            );
            csvRows.push(
              [
                province.code, province.isoCode, province.name,
                district.code, district.name,
                sector.code, sector.name,
                cell.code, cell.name,
                village.code, village.name, village.id, village.nep,
              ]
                .map(csvField)
                .join(","),
            );
          }
        }
      }
    }
  }
  sql.push("COMMIT;");

  const csvPath = path.join(outDir, "villages.csv");
  const sqlPath = path.join(outDir, "rwanda.sql");
  fs.writeFileSync(csvPath, csvRows.join("\n") + "\n", "utf8");
  fs.writeFileSync(sqlPath, sql.join("\n") + "\n", "utf8");
  console.log(`Wrote ${csvPath} (${csvRows.length - 1} rows)`);
  console.log(`Wrote ${sqlPath}`);

  const sqlitePath = path.join(outDir, "rwanda.sqlite");
  try {
    fs.rmSync(sqlitePath, { force: true });
    execFileSync("sqlite3", [sqlitePath], { input: fs.readFileSync(sqlPath) });
    console.log(`Wrote ${sqlitePath}`);
  } catch (error) {
    console.warn(`Skipped ${sqlitePath}: sqlite3 CLI not available (${error.message})`);
  }
}

main();
