# Rwanda Administrative Hierarchy API

This project provides a structured dataset and API for Rwanda administrative levels:

`Country -> Province -> District -> Sector -> Cell -> Village`

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

## Use as a Package

This repository can also be used as a Node package (CommonJS).

Example usage:

```js
const {
  getDataset,
  getProvinces,
  getDistrictsByProvinceId,
} = require("@derrickmugisha/rwanda-admin-hierarchy");

const dataset = getDataset();
const provinces = getProvinces();
const districts = getDistrictsByProvinceId("province-umujyi-wa-kigali");
```

Exported package functions:
- `getDataset()`
- `getProvinces()`
- `getDistrictsByProvinceId(provinceId)`
- `getSectorsByDistrictId(districtId)`
- `getCellsBySectorId(sectorId)`
- `getVillagesByCellId(cellId)`
- `loadDataset()`

Build npm tarball locally:

```bash
npm pack
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
