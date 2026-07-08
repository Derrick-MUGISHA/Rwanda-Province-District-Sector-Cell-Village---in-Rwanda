# rwanda_admin (Flutter)

Complete Rwanda administrative hierarchy — Province › District › Sector ›
Cell › Village — bundled as a Flutter package. Same dataset as the
[npm](https://www.npmjs.com/package/rwanda-admin),
[PyPI](https://pypi.org/project/rwanda-admin/), and Maven packages.

- 5 provinces · 30 districts · 416 sectors · 2,142 cells · 14,816 villages
- Sourced from the official NISR "List of Villages" (snapshot in `dataVersion`)
- Data licensed CC BY 4.0, code ISC

## Installation

```bash
flutter pub add rwanda_admin
```

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

## Releasing

Published to [pub.dev](https://pub.dev/packages/rwanda_admin) by the manual
"Release Packages" GitHub Actions workflow, which injects the release version
into `pubspec.yaml` (the committed `0.0.0` is a placeholder — never bump it by
hand). Add a matching entry to `CHANGELOG.md` before releasing.
