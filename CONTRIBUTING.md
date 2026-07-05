# Contributing

Thank you for helping make this the most reliable open dataset of Rwanda's
administrative hierarchy. Local knowledge is what keeps this data correct —
corrections from people who live in or work with these places are the most
valuable contribution of all.

## Reporting wrong or missing data

If a province, district, sector, cell, or village is misspelled, missing, in
the wrong parent, or has been changed by a boundary reform:

1. Open a [data correction issue](../../issues/new?template=data-correction.yml).
2. Include the NISR code if you know it (e.g. village `11010103`) and, if
   possible, a reference (NISR/MINALOC publication, official gazette, local
   government source).

Please note the dataset intentionally mirrors the official NISR "List of
Villages" snapshot recorded in `dataVersion` (see
`data/rwanda-administrative.json`). Corrections that differ from the official
source need an official reference so users can trust every entry.

## Contributing code

1. Fork and create a feature branch.
2. `npm install`, then make your change.
3. Run the checks that CI runs:
   ```bash
   npm run validate:data
   npm test
   cd python && python -m unittest discover -s tests   # if you touched Python
   mvn -f java-mvn/pom.xml test                        # if you touched Java
   ```
4. Open a pull request describing what changed and why.

### Changing the dataset

The JSON is generated — never edit `data/rwanda-administrative.json` by hand:

1. `npm run build:data` rebuilds it from the source PDF (requires `pdftotext`)
   and syncs the copies bundled by the Python/Dart packages.
2. If any node id disappears or changes, add a migration entry to
   `data/changes.json` (`oldId` → `newId`), so `resolveId()` keeps working for
   systems that stored old ids. `npm run validate:data` enforces this.

## Release flow

Releases are published from GitHub Actions (`Release Packages` workflow) to
npm, GitHub Packages, PyPI, and Maven Central/GitHub. CSV/SQL/SQLite exports
are attached to each GitHub release automatically.
