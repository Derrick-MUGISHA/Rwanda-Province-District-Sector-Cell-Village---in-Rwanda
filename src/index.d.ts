export type Level = "province" | "district" | "sector" | "cell" | "village";

export interface Village {
  id: string;
  name: string;
  /** 8-digit NISR village code (e.g. "11010103"), or null if not encoded in the id. */
  code: string | null;
  /**
   * National Electrification Plan category from the source document:
   * "GE" (grid extension), "SAS" (standalone solar) or "Microgrid".
   */
  nep: "GE" | "SAS" | "Microgrid";
}

export interface Cell {
  id: string;
  name: string;
  /**
   * 6-digit NISR cell code. Null for the few cells whose villages span two
   * official NISR cells (merged "I"/"II" pairs in the source PDF).
   */
  code: string | null;
  villages: Village[];
}

export interface Sector {
  id: string;
  name: string;
  /** 4-digit NISR sector code. */
  code: string | null;
  cells: Cell[];
}

export interface District {
  id: string;
  name: string;
  /** 2-digit NISR district code (e.g. "11" for Nyarugenge). */
  code: string | null;
  sectors: Sector[];
}

export interface Province {
  id: string;
  name: string;
  /** 1-digit NISR province code ("1" = Kigali City, "2" = Southern, ...). */
  code: string | null;
  /** ISO 3166-2:RW subdivision code (e.g. "RW-01" for the City of Kigali). */
  isoCode: string | null;
  /** Common English/French name variants (e.g. "City of Kigali"). */
  nameVariants: string[];
  districts: District[];
}

export interface Dataset {
  country: string;
  /** Schema version of the JSON structure. */
  version: string;
  /** Snapshot date of the administrative structure ("YYYY-MM"). Independent of the package version. */
  dataVersion: string;
  /** Citation of the official dataset the JSON was generated from. */
  source: string;
  /** ISO date the source document was published/created. */
  sourceDate: string;
  /** SPDX identifier of the dataset license (the code is licensed separately). */
  license: string;
  /** Explanation of the coding standards used for code/isoCode fields. */
  codeStandard: string;
  provinces: Province[];
}

export interface DataMeta {
  country: string;
  version: string;
  dataVersion: string;
  source: string;
  sourceDate: string;
  license: string;
  codeStandard: string;
  counts: {
    provinces: number;
    districts: number;
    sectors: number;
    cells: number;
    villages: number;
  };
}

export type AnyNode = Province | District | Sector | Cell | Village;

export interface DatasetIndex {
  provinces: Map<string, Province>;
  districts: Map<string, District>;
  sectors: Map<string, Sector>;
  cells: Map<string, Cell>;
  villages: Map<string, Village>;
}

export interface LoadedDataset {
  dataset: Readonly<Dataset>;
  index: DatasetIndex;
}

/** Lightweight view of a node (no children), as returned in paths and search results. */
export interface NodeSummary {
  level: Level;
  id: string;
  name: string;
  code: string | null;
  /** Present on province summaries only. */
  isoCode?: string | null;
}

/** Full ancestor chain of a node, keyed by level. Deeper levels are present only when they apply. */
export interface HierarchyPath {
  province: NodeSummary;
  district?: NodeSummary;
  sector?: NodeSummary;
  cell?: NodeSummary;
  village?: NodeSummary;
}

export interface SearchOptions {
  /** Restrict matching to these levels. Throws RangeError on unknown level names. */
  levels?: Level[];
  /** Maximum number of results (default 20). */
  limit?: number;
  /** Enable typo-tolerant matching (default true). */
  fuzzy?: boolean;
}

export interface SearchResult extends NodeSummary {
  /** The name (or province name variant) the query matched against. */
  matchedName: string;
  /** Relevance in (0, 1]; 1 is an exact (diacritic/case-insensitive) match. */
  score: number;
  path: HierarchyPath;
}

/**
 * Hierarchy parts to validate. Each value may be an id
 * ("province-umujyi-wa-kigali"), an NISR/ISO code ("11", "RW-01"), or a name
 * (case- and diacritic-insensitive).
 */
export interface HierarchyParts {
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  /** The resolved chain when valid, otherwise null. */
  match: HierarchyPath | null;
}

/** Returns the full, deep-frozen dataset. Loaded from disk once and cached. */
export function getDataset(): Readonly<Dataset>;

/** Returns dataset provenance (source, dataVersion, license) and per-level counts. */
export function getDataMeta(): DataMeta;

/** Returns all provinces. */
export function getProvinces(): Province[];

/** Returns the districts of a province, or null if the province ID is unknown. */
export function getDistrictsByProvinceId(provinceId: string): District[] | null;

/** Returns the sectors of a district, or null if the district ID is unknown. */
export function getSectorsByDistrictId(districtId: string): Sector[] | null;

/** Returns the cells of a sector, or null if the sector ID is unknown. */
export function getCellsBySectorId(sectorId: string): Cell[] | null;

/** Returns the villages of a cell, or null if the cell ID is unknown. */
export function getVillagesByCellId(cellId: string): Village[] | null;

/** Returns all 30 districts as a flat list. */
export function getAllDistricts(): District[];

/** Returns all sectors as a flat list. */
export function getAllSectors(): Sector[];

/** Returns all cells as a flat list. */
export function getAllCells(): Cell[];

/** Returns all villages as a flat list. */
export function getAllVillages(): Village[];

/** Looks up any node (at any level) by its id. */
export function getById(id: string): { level: Level; item: AnyNode } | null;

/** Looks up any node by NISR code (e.g. "11", 11010103) or ISO 3166-2 code ("RW-01"). */
export function getByCode(code: string | number): { level: Level; item: AnyNode } | null;

/**
 * Reverse lookup: returns the full ancestor chain of any node id
 * (e.g. getPath("village-11010103") returns province through village), or
 * null if the id is unknown.
 */
export function getPath(id: string): HierarchyPath | null;

/**
 * Case-, diacritic-insensitive and typo-tolerant name search across all
 * levels. Results are sorted by relevance and include the full ancestor path.
 */
export function search(query: string, options?: SearchOptions): SearchResult[];

/** Validates that the provided levels exist and form a single consistent chain. */
export function validateHierarchy(parts: HierarchyParts): ValidationResult;

/** Boolean shorthand for validateHierarchy(parts).valid. */
export function isValidHierarchy(parts: HierarchyParts): boolean;

/** One entry of the dataset's id migration map (data/changes.json). */
export interface IdChange {
  /** Package version that introduced the change. */
  sinceVersion: string;
  type: "merged" | "renamed" | "moved" | "removed";
  level: Level;
  oldId: string;
  /** Null only for type "removed". */
  newId: string | null;
  reason: string;
}

/** Returns the full id migration history across dataset versions. */
export function getIdChanges(): IdChange[];

/**
 * Resolves an id from any previous dataset version to the current one.
 * Returns the id unchanged when it still exists, the replacement id when it
 * was migrated, and null when it is unknown.
 */
export function resolveId(id: string): string | null;

/** Loads (or returns the cached) dataset together with lookup indexes. */
export function loadDataset(): LoadedDataset;
