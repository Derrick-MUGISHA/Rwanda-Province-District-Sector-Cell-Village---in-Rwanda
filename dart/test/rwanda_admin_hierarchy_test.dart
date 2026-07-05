import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:rwanda_admin_hierarchy/rwanda_admin_hierarchy.dart';

void main() {
  final text = File('lib/src/rwanda_administrative.json').readAsStringSync();
  final rwanda = RwandaAdminHierarchy.fromJsonString(text);

  test('dataset carries provenance metadata', () {
    expect(rwanda.country, 'Rwanda');
    expect(rwanda.dataVersion, '2019-07');
    expect(rwanda.license, 'CC-BY-4.0');
  });

  test('hierarchy traverses province to village', () {
    expect(rwanda.provinces.length, 5);
    final districts = rwanda.districtsByProvinceId(rwanda.provinces.first.id);
    expect(districts, isNotNull);
    expect(districts, isNotEmpty);

    final sectors = rwanda.sectorsByDistrictId(districts!.first.id);
    final cells = rwanda.cellsBySectorId(sectors!.first.id);
    final villages = rwanda.villagesByCellId(cells!.first.id);
    expect(villages, isNotEmpty);
    expect(villages!.first.code, isNotNull);
  });

  test('unknown ids return null', () {
    expect(rwanda.districtsByProvinceId('no-such-id'), isNull);
    expect(rwanda.sectorsByDistrictId('no-such-id'), isNull);
    expect(rwanda.cellsBySectorId('no-such-id'), isNull);
    expect(rwanda.villagesByCellId('no-such-id'), isNull);
  });
}
