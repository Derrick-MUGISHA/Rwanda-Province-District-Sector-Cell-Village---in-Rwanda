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
from rwanda_admin_hierarchy import (
    get_dataset,
    get_provinces,
    get_districts_by_province_id,
)

dataset = get_dataset()
provinces = get_provinces()
districts = get_districts_by_province_id("province-umujyi-wa-kigali")
```
