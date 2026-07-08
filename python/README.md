# Rwanda Admin Hierarchy (Python)

Python package for querying Rwanda administrative hierarchy data:

`Country -> Province -> District -> Sector -> Cell -> Village`

## Source of Information

This package is built from:
- `Guidence.md`
- `List_of_Villages_for_all_technology.pdf`

## Install (local)

```bash
pip install .
```

Run from the `python` directory.

## Usage

```python
from rwanda_admin import (
    get_dataset,
    get_provinces,
    get_districts_by_province_id,
)

dataset = get_dataset()
provinces = get_provinces()
districts = get_districts_by_province_id("province-umujyi-wa-kigali")
```

## FastAPI integration

```bash
pip install "rwanda-admin[fastapi]"
```

```python
from fastapi import FastAPI
from rwanda_admin.integrations.fastapi import create_router

app = FastAPI()
app.include_router(create_router(), prefix="/api/rwanda")
```

## Django integration

```bash
pip install "rwanda-admin[django]"
```

```python
# urls.py
from django.urls import include, path

urlpatterns = [
    path("api/rwanda/", include("rwanda_admin.integrations.django")),
]
```

Both integrations expose the same read-only endpoints relative to the mount
point: `meta`, `provinces`, `provinces/<id>/districts`,
`districts/<id>/sectors`, `sectors/<id>/cells` and `cells/<id>/villages`.
List responses omit child collections so they stay small enough for
dropdowns; unknown ids return HTTP 404.
