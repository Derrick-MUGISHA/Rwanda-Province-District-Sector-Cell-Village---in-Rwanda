# Rwanda Administrative Hierarchy API

[![npm version](https://img.shields.io/npm/v/@derrick63/rwanda-admin-hierarchy)](https://www.npmjs.com/package/@derrick63/rwanda-admin-hierarchy)
[![license](https://img.shields.io/badge/license-ISC-blue.svg)](./LICENSE)

This project provides a structured dataset and API for Rwanda administrative levels:

`Country -> Province -> District -> Sector -> Cell -> Village`

**5 provinces · 30 districts · 416 sectors · 2,142 cells · 14,816 villages** —
sourced from the official NISR "List of Villages", with NISR codes at every
level, ISO 3166-2 province codes, name search, and address validation.
Available for [Node.js](https://www.npmjs.com/package/@derrick63/rwanda-admin-hierarchy),
[Python](https://pypi.org/project/rwanda-admin-hierarchy/), Java (GitHub
Packages), and Flutter (`dart/`), plus CSV/SQL/SQLite exports on every release.

The code is ISC-licensed; the dataset is licensed [CC BY 4.0](./LICENSE-DATA).
Wrong or missing place? Please
[open a data-correction issue](../../issues/new/choose) — local knowledge keeps
this dataset trustworthy. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Install

```bash
npm install @derrick63/rwanda-admin-hierarchy
```

The published package is a **zero-dependency** data library with bundled TypeScript
type definitions. The Express API server described below is a development/deployment
extra and its dependencies are only installed when working inside this repository.

## Information Source

All data structure, rules, and implementation behavior in this project are based on these two repository documents:

- `Guidence.md` (implementation guidance and system rules)
- `List_of_Villages_for_all_technology.pdf` (primary administrative data source used to build the JSON dataset)

No external assumptions are required to run or use this project.

## What This Project Contains

- `data/rwanda-administrative.json`  
  Generated hierarchical dataset.
- `src/server.js`  
  Express API server with endpoints by hierarchy level.
- `src/data-store.js`  
  Loads and caches JSON once in memory.
- `scripts/build-json-from-pdf.js`  
  Rebuilds JSON dataset from the provided PDF.
- `scripts/validate-data.js`  
  Checks integrity rules (IDs, structure, duplicates within level).
- `TECHNICAL_DOCUMENTATION.md`  
  Full technical explanation of the system and constraints.

## Requirements

- Node.js (recommended: version 18+)
- npm
- `pdftotext` installed (used by the build script)
- Java 17+ and Maven (only if you want the Java package)
- Python 3.9+ (only if you want the Python package)

## Environment Configuration

This project uses environment variables for secure runtime behavior.

1) Copy the template:

```bash
cp .env.example .env
```

2) Edit `.env` for your environment.

Important variables:
- `PORT`
- `ENABLE_FULL_DATASET_ENDPOINT`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_WINDOW_MS`
- `ALLOWED_ORIGINS`
- `TRUST_PROXY` (set when running behind a reverse proxy so rate limiting sees real client IPs)

Never store publishing tokens (npm, PyPI, Maven) in `.env`. Use GitHub Actions
secrets for CI releases and `npm login` for local publishing.

## How to Run (Step by Step)

### 1) Install dependencies

```bash
npm install
```

### 2) Build the JSON dataset from the PDF

```bash
npm run build:data
```

This reads `List_of_Villages_for_all_technology.pdf` and writes:

`data/rwanda-administrative.json`

### 3) Validate data integrity

```bash
npm run validate:data
```

This validates:
- Required hierarchy structure
- Unique IDs
- Duplicate names within the same level
- Nested object completeness

### 4) Start the API server

```bash
npm start
```

Default server URL:

`http://localhost:3000`

## API Endpoints

### Health check

`GET /health`

### Full dataset

`GET /api/dataset`

### All provinces

`GET /api/provinces`

### Districts by province ID

`GET /api/provinces/:provinceId/districts`

### Sectors by district ID

`GET /api/districts/:districtId/sectors`

### Cells by sector ID

`GET /api/sectors/:sectorId/cells`

### Villages by cell ID

`GET /api/cells/:cellId/villages`

### Search by name (any level)

`GET /api/search?q=gitega&levels=sector,cell&limit=10`

Case-, diacritic-insensitive and typo-tolerant. `levels` and `limit` are optional.

### Reverse lookup (full ancestor chain)

`GET /api/path/:id` — e.g. `/api/path/village-11010103`

### Validate an address hierarchy

`GET /api/validate?province=Kigali&district=Nyarugenge&sector=Gitega`

Each level accepts an ID, an NISR/ISO code, or a name. Returns `{ valid, errors, match }`.

## Use as a Package

This repository can also be used as a Node package (CommonJS).

Example usage:

```js
const {
  getProvinces,
  getDistrictsByProvinceId,
  search,
  getPath,
  getByCode,
  isValidHierarchy,
} = require("@derrick63/rwanda-admin-hierarchy");

// Top-down traversal
const provinces = getProvinces();
const districts = getDistrictsByProvinceId("province-umujyi-wa-kigali");

// Name search — case-, diacritic-insensitive and typo-tolerant
search("gítega");                        // matches "Gitega" at any level
search("Gitegga", { levels: ["sector"] }); // misspellings still match

// Reverse lookup: village -> cell -> sector -> district -> province
const path = getPath("village-11010103");
// path.province.name === "Umujyi wa Kigali", path.sector.name === "Gitega", ...

// Standard codes: NISR administrative codes and ISO 3166-2
getByCode("RW-01");    // City of Kigali (ISO 3166-2:RW)
getByCode("11");       // Nyarugenge district (NISR code)
getByCode("11010103"); // village by its 8-digit NISR code

// Address/form validation — accepts names, ids, or codes at each level
isValidHierarchy({
  province: "Kigali",
  district: "Nyarugenge",
  sector: "Gitega",
  cell: "Akabahizi",
  village: "Iterambere",
}); // true
```

Exported package functions:

Hierarchy traversal:
- `getDataset()`
- `getProvinces()`
- `getDistrictsByProvinceId(provinceId)`
- `getSectorsByDistrictId(districtId)`
- `getCellsBySectorId(sectorId)`
- `getVillagesByCellId(cellId)`
- `loadDataset()`

Flat accessors (dropdowns, validation lists):
- `getAllDistricts()`, `getAllSectors()`, `getAllCells()`, `getAllVillages()`

Search and lookup:
- `search(query, { levels?, limit?, fuzzy? })` — fuzzy name search across all levels; every result includes its full ancestor `path`
- `getById(id)` — resolve any ID at any level
- `getByCode(code)` — resolve NISR codes (`"11"`, `"1101"`, `"11010103"`) and ISO 3166-2 province codes (`"RW-01"`)
- `getPath(id)` — reverse lookup / ancestry for any ID

Validation:
- `isValidHierarchy(parts)` — boolean check that the given levels form one consistent chain
- `validateHierarchy(parts)` — same, but returns `{ valid, errors, match }`

Provenance and migrations:
- `getDataMeta()` — dataset provenance (`dataVersion`, `source`, `license`) and per-level counts
- `resolveId(oldId)` — resolves ids from previous dataset versions via the migration map
- `getIdChanges()` — the raw migration history (`data/changes.json`)

### Use in React (or any browser bundler)

The lookup API is bundler-friendly: it has no Node-only dependencies, so the
same package works in React, Vue, Svelte or plain browser apps built with
Vite, webpack or Next.js. TypeScript definitions ship with the package.

```jsx
import { getProvinces, getDistrictsByProvinceId, search } from "@derrick63/rwanda-admin-hierarchy";

function ProvincePicker({ onSelect }) {
  return (
    <select onChange={(e) => onSelect(getDistrictsByProvinceId(e.target.value))}>
      {getProvinces().map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}
```

Bundle-size note: importing the API inlines the full dataset (~3.1 MB raw,
~340 KB gzipped over the wire). If that is too heavy for your app, either
lazy-load your route with `React.lazy`/dynamic `import()`, import only the
per-province JSON you need (`@derrick63/rwanda-admin-hierarchy/data/provinces/umujyi-wa-kigali.json`),
or keep the package on the server and expose it through the bundled Express
API (`npm start`) or your own backend.

### Standard codes

Every node carries a `code` field with its official NISR administrative code,
derived from the village codes in the source dataset:

| Level | Code format | Example |
| --- | --- | --- |
| Province | 1 digit | `1` (Kigali City) |
| District | 2 digits | `11` (Nyarugenge) |
| Sector | 4 digits | `1101` (Gitega) |
| Cell | 6 digits | `110101` (Akabahizi) |
| Village | 8 digits | `11010103` (Iterambere) |

Provinces additionally carry:
- `isoCode` — the ISO 3166-2:RW subdivision code (`RW-01` … `RW-05`)
- `nameVariants` — common English/French names (`"City of Kigali"`, `"Southern Province"`, …), which `search()` also matches

Note: a few cells in the source PDF merge official NISR "I"/"II" cell pairs
(e.g. Munanira I/II); those cells have `code: null` because no single official
code applies.

TypeScript definitions are bundled (`src/index.d.ts`), so all functions and the
dataset shape are fully typed out of the box.

The raw JSON dataset can also be imported directly:

```js
const dataset = require("@derrick63/rwanda-admin-hierarchy/data");
```

Browser or serverless code that only needs one province can lazy-load a slice
(~230–760 KB instead of the full dataset):

```js
const kigali = require("@derrick63/rwanda-admin-hierarchy/data/provinces/umujyi-wa-kigali.json");
// data/provinces/index.json lists all five slices
```

Build npm tarball locally:

```bash
npm pack
```

### Dataset versioning and id migrations

The data snapshot is versioned independently of the package: `getDataMeta()`
returns `dataVersion` (currently `2019-07`, the NISR source publication date).
When a rebuild removes or renames a node id, the migration is recorded in
`data/changes.json` and old ids keep resolving:

```js
const { resolveId } = require("@derrick63/rwanda-admin-hierarchy");
resolveId("province-umujyi-wa-kigali-district-nyarugenge-sector-mageragere");
// -> "province-umujyi-wa-kigali-district-nyarugenge-sector-mageregere"
```

### Electrification (NEP) categories

Each village carries the National Electrification Plan category from the
source document as `nep`: `"GE"` (grid extension), `"SAS"` (standalone solar),
or `"Microgrid"`.

### Flat exports (CSV / SQL / SQLite)

Analysts and non-JS users can grab flat files from every GitHub release —
`villages.csv` (one denormalized row per village), `rwanda.sql` (portable
schema + inserts), and `rwanda.sqlite` — or generate them locally:

```bash
npm run export:data   # writes exports/
```

## Use as a Maven Package (Java)

The Java package is in `java-mvn`.

### Build the JAR

```bash
mvn -f java-mvn/pom.xml clean package
```

The JAR will be created in:

`java-mvn/target/rwanda-admin-hierarchy-1.0.0.jar`

### Install to your local Maven repository

```bash
mvn -f java-mvn/pom.xml clean install
```

### Add dependency in your Java app

```xml
<dependency>
  <groupId>io.github.derickmugisha</groupId>
  <artifactId>rwanda-admin-hierarchy</artifactId>
  <version>1.0.0</version>
</dependency>
```

### Java usage example

```java
import io.github.derickmugisha.rwanda.RwandaHierarchyService;

RwandaHierarchyService service = RwandaHierarchyService.loadDefault();
var provinces = service.getProvinces();
var districts = service.getDistrictsByProvinceId("province-umujyi-wa-kigali");
```

## Use as a Python Package

Python package path:

`python/`

### Build Python distributions

```bash
python3 -m pip install --upgrade build
python3 -m build python
```

Build output:

`python/dist/`

### Install locally for testing

```bash
python3 -m pip install python/dist/*.whl
```

### Python usage example

```python
from rwanda_admin_hierarchy import get_provinces, get_districts_by_province_id

provinces = get_provinces()
districts = get_districts_by_province_id("province-umujyi-wa-kigali")
```

## CI/CD Pipelines

GitHub Actions workflows are included:

- `.github/workflows/ci-security.yml`
  - Optimized checks with dependency caching for Node, Python, and Maven
  - Builds all package targets
  - Runs dependency audits (`npm audit`, `pip-audit`)
- `.github/workflows/release-packages.yml`
  - Manual release pipeline for npm, PyPI, and Maven
  - Creates git tag and GitHub Release automatically after publish

## Quick Usage Examples

Get all provinces:

```bash
curl http://localhost:3000/api/provinces
```

Get districts of a province:

```bash
curl http://localhost:3000/api/provinces/province-umujyi-wa-kigali/districts
```

Get sectors of a district:

```bash
curl http://localhost:3000/api/districts/province-umujyi-wa-kigali-district-nyarugenge/sectors
```

Get cells of a sector:

```bash
curl http://localhost:3000/api/sectors/province-umujyi-wa-kigali-district-nyarugenge-sector-gitega/cells
```

Get villages of a cell:

```bash
curl http://localhost:3000/api/cells/province-umujyi-wa-kigali-district-nyarugenge-sector-gitega-cell-akabahizi/villages
```

## Error Behavior

If an ID is not found, the API returns:

- HTTP `404`
- JSON error message like:

```json
{ "error": "Province not found" }
```

(Message varies by level: Province, District, Sector, or Cell.)

## Use as a Flutter Package

A Flutter package with the same dataset lives in `dart/`
(`rwanda_admin_hierarchy`). It bundles the JSON as an asset and exposes typed
models with the same traversal API:

```dart
import 'package:rwanda_admin_hierarchy/rwanda_admin_hierarchy.dart';

final rwanda = await RwandaAdminHierarchy.load();
final districts = rwanda.districtsByProvinceId('province-umujyi-wa-kigali');
```

It is not yet published to pub.dev; see `dart/README.md`.

## Data and Logic Separation

In line with `Guidence.md`, data is kept in the `data` folder and separated from application logic.  
This allows:
- Updating data without modifying backend code
- Easy migration to a database later

## End-to-End Flow

1. Source data comes from `List_of_Villages_for_all_technology.pdf`
2. Build script transforms it into hierarchical JSON
3. Validation script checks integrity rules
4. Server loads and caches JSON
5. API serves structured hierarchy responses

## Notes

- If you update the PDF, run `npm run build:data` again.
- Then always run `npm run validate:data` before starting the server.
- Before publishing or releasing, run `npm run validate:data`.
