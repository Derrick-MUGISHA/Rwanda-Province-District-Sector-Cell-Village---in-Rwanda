/// Complete Rwanda administrative hierarchy
/// (Province > District > Sector > Cell > Village) with NISR codes.
///
/// ```dart
/// final rwanda = await RwandaAdminHierarchy.load();
/// final provinces = rwanda.provinces;
/// final districts = rwanda.districtsByProvinceId(provinces.first.id);
/// ```
library rwanda_admin;

import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;

class Village {
  final String id;
  final String name;

  /// National Electrification Plan category from the source document:
  /// "GE" (grid extension), "SAS" (standalone solar) or "Microgrid".
  final String? nep;

  const Village({required this.id, required this.name, this.nep});

  /// 8-digit NISR village code encoded in the id, when present.
  String? get code {
    final match = RegExp(r'^village-(\d{8,10})$').firstMatch(id);
    return match?.group(1);
  }

  factory Village.fromJson(Map<String, dynamic> json) => Village(
        id: json['id'] as String,
        name: json['name'] as String,
        nep: json['nep'] as String?,
      );
}

class Cell {
  final String id;
  final String name;
  final List<Village> villages;

  const Cell({required this.id, required this.name, required this.villages});

  factory Cell.fromJson(Map<String, dynamic> json) => Cell(
        id: json['id'] as String,
        name: json['name'] as String,
        villages: [
          for (final v in json['villages'] as List)
            Village.fromJson(v as Map<String, dynamic>)
        ],
      );
}

class Sector {
  final String id;
  final String name;
  final List<Cell> cells;

  const Sector({required this.id, required this.name, required this.cells});

  factory Sector.fromJson(Map<String, dynamic> json) => Sector(
        id: json['id'] as String,
        name: json['name'] as String,
        cells: [
          for (final c in json['cells'] as List)
            Cell.fromJson(c as Map<String, dynamic>)
        ],
      );
}

class District {
  final String id;
  final String name;
  final List<Sector> sectors;

  const District({required this.id, required this.name, required this.sectors});

  factory District.fromJson(Map<String, dynamic> json) => District(
        id: json['id'] as String,
        name: json['name'] as String,
        sectors: [
          for (final s in json['sectors'] as List)
            Sector.fromJson(s as Map<String, dynamic>)
        ],
      );
}

class Province {
  final String id;
  final String name;
  final List<District> districts;

  const Province(
      {required this.id, required this.name, required this.districts});

  factory Province.fromJson(Map<String, dynamic> json) => Province(
        id: json['id'] as String,
        name: json['name'] as String,
        districts: [
          for (final d in json['districts'] as List)
            District.fromJson(d as Map<String, dynamic>)
        ],
      );
}

class RwandaAdminHierarchy {
  final String country;

  /// Snapshot date of the administrative structure ("YYYY-MM").
  final String? dataVersion;
  final String? source;
  final String? license;
  final List<Province> provinces;

  final Map<String, Province> _provinceById = {};
  final Map<String, District> _districtById = {};
  final Map<String, Sector> _sectorById = {};
  final Map<String, Cell> _cellById = {};

  RwandaAdminHierarchy._({
    required this.country,
    required this.provinces,
    this.dataVersion,
    this.source,
    this.license,
  }) {
    for (final p in provinces) {
      _provinceById[p.id] = p;
      for (final d in p.districts) {
        _districtById[d.id] = d;
        for (final s in d.sectors) {
          _sectorById[s.id] = s;
          for (final c in s.cells) {
            _cellById[c.id] = c;
          }
        }
      }
    }
  }

  /// Loads the dataset bundled with this package (Flutter asset bundle).
  static Future<RwandaAdminHierarchy> load() async {
    final text = await rootBundle.loadString(
        'packages/rwanda_admin/src/rwanda_administrative.json');
    return RwandaAdminHierarchy.fromJsonString(text);
  }

  /// Parses a dataset from a JSON string (for non-Flutter use, pass the
  /// contents of data/rwanda-administrative.json).
  factory RwandaAdminHierarchy.fromJsonString(String text) {
    final json = jsonDecode(text) as Map<String, dynamic>;
    return RwandaAdminHierarchy._(
      country: json['country'] as String,
      dataVersion: json['dataVersion'] as String?,
      source: json['source'] as String?,
      license: json['license'] as String?,
      provinces: [
        for (final p in json['provinces'] as List)
          Province.fromJson(p as Map<String, dynamic>)
      ],
    );
  }

  List<District>? districtsByProvinceId(String id) =>
      _provinceById[id]?.districts;

  List<Sector>? sectorsByDistrictId(String id) => _districtById[id]?.sectors;

  List<Cell>? cellsBySectorId(String id) => _sectorById[id]?.cells;

  List<Village>? villagesByCellId(String id) => _cellById[id]?.villages;
}
