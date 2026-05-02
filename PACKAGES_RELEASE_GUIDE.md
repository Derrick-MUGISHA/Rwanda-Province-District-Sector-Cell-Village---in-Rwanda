# Packages and Release Guide

This guide explains how to build and release all packages in this repository:

- Node.js (`npm`)
- Java (`Maven`)
- Python (`PyPI`)

## Information Source

The dataset and hierarchy behavior are based on:
- `Guidence.md`
- `List_of_Villages_for_all_technology.pdf`

## Environment and Secrets

Use:
- `.env.example` as the public template
- local `.env` for runtime values

For CI/CD release, define GitHub Actions secrets:
- `NPM_TOKEN`
- `PYPI_API_TOKEN`
- `MAVEN_USERNAME` (optional, if not using `GITHUB_TOKEN`)
- `MAVEN_PASSWORD` (optional, if not using `GITHUB_TOKEN`)

## 1) Node.js Package (npm)

### Build and validate

```bash
npm install
npm run build:data
npm run validate:data
npm pack
```

Output package:
- `derrickmugisha-rwanda-admin-hierarchy-1.0.0.tgz`

### Publish to npm

```bash
npm login
npm publish
```

## 2) Java Package (Maven)

Java module path:
- `java-mvn/`

### Build JAR

```bash
mvn -f java-mvn/pom.xml clean package
```

Output JAR:
- `java-mvn/target/rwanda-admin-hierarchy-1.0.0.jar`

### Install locally (for local app use)

```bash
mvn -f java-mvn/pom.xml clean install
```

### Publish remotely (if you have repository credentials)

Configure distribution management/credentials, then:

```bash
mvn -f java-mvn/pom.xml clean deploy
```

## 3) Python Package (PyPI)

Python module path:
- `python/`

### Build wheel and source distribution

```bash
python3 -m pip install --upgrade build twine
python3 -m build python
```

Output files:
- `python/dist/*.whl`
- `python/dist/*.tar.gz`

### Validate and publish

```bash
python3 -m twine check python/dist/*
python3 -m twine upload python/dist/*
```

## 4) Suggested Release Order

1. Rebuild data and validate:
   - `npm run build:data`
   - `npm run validate:data`
2. Build all package artifacts (npm, Maven, Python)
3. Publish packages
4. Run GitHub release pipeline (`release-packages.yml`)
5. Confirm git tag and GitHub release notes were created

## 5) GitHub Actions Pipelines

- `ci-security.yml`
  - Parallelized package builds for Node, Java, Python
  - Uses dependency cache for faster runs
  - Runs dependency audits
- `release-packages.yml`
  - Manual release workflow for npm, PyPI, and Maven
  - Creates version tag and GitHub release

## 6) Release Checklist

- [ ] Dataset rebuilt from source PDF
- [ ] Dataset integrity validation passes
- [ ] npm tarball created
- [ ] Java JAR built
- [ ] Python wheel/sdist built
- [ ] Package docs updated (`README.md`)
- [ ] Version numbers updated where needed
- [ ] Git tag created (example: `v1.1.0`)
- [ ] GitHub release created
