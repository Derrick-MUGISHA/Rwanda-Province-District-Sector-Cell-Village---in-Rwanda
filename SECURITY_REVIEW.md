# Security Review and Hardening Notes

## Scope

Review performed on:
- Node API (`src/server.js`, `src/data-store.js`)
- Java package service
- Python package service
- Build and release workflows

## Findings and Fixes

### 1) Missing API hardening headers and request limits
- **Risk:** Higher exposure to common web attack vectors and abusive request bursts.
- **Fix:** Added `helmet` for secure headers and `express-rate-limit` for throttling.

### 2) Unrestricted cross-origin access
- **Risk:** Uncontrolled browser-origin access to API responses.
- **Fix:** Added explicit CORS policy based on `ALLOWED_ORIGINS`.

### 3) Full dataset endpoint always exposed
- **Risk:** Large response can be abused for excessive bandwidth/memory pressure.
- **Fix:** Added environment flag `ENABLE_FULL_DATASET_ENDPOINT`; disabled by default.

### 4) Unvalidated ID path parameters
- **Risk:** Unexpected long/special input values can increase processing overhead.
- **Fix:** Added strict ID format validation and `400` responses for invalid IDs.

### 5) Mutable shared cache object in memory
- **Risk:** Accidental mutation by consumers may create inconsistent state and memory growth patterns.
- **Fix:** Deep-freeze dataset after load to avoid in-memory mutation leaks.

### 6) Java package source duplication issue
- **Risk:** Duplicate class content in one file can break builds and supply-chain release flow.
- **Fix:** Cleaned `RwandaHierarchyService` to a single consistent class definition.

## Security Defaults

Default secure behavior from `.env.example`:
- Full dataset endpoint disabled
- Request rate limiting enabled
- Explicit origin allowlist support
- No secrets committed to repository

## Secret Management

Do not store real tokens in files. Use:
- GitHub Actions secrets (`NPM_TOKEN`, `PYPI_API_TOKEN`, etc.)
- Local `.env` for non-sensitive runtime settings only
