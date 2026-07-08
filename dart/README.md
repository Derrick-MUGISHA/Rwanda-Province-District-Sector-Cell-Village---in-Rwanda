# rwanda_admin (Flutter)

Complete Rwanda administrative hierarchy — Province › District › Sector ›
Cell › Village — bundled as a Flutter package. Same dataset as the
[npm](https://www.npmjs.com/package/rwanda-admin),
[PyPI](https://pypi.org/project/rwanda-admin/), and Maven packages.

- 5 provinces · 30 districts · 416 sectors · 2,142 cells · 14,816 villages
- Sourced from the official NISR "List of Villages" (snapshot in `dataVersion`)
- Data licensed CC BY 4.0, code ISC

## Usage

```dart
import 'package:rwanda_admin/rwanda_admin.dart';

final rwanda = await RwandaAdminHierarchy.load();

for (final province in rwanda.provinces) {
  print('${province.name}: ${province.districts.length} districts');
}

final districts = rwanda.districtsByProvinceId('province-umujyi-wa-kigali');
```

The dataset JSON in `lib/src/` is generated — do not edit it by hand. It is
kept in sync with the canonical `data/rwanda-administrative.json` by
`npm run sync:data` in the repository root.

## Status

This package is not yet published to pub.dev and has not been built against a
local Flutter SDK; treat it as a starting point and run
`flutter pub get && flutter test` before publishing.
