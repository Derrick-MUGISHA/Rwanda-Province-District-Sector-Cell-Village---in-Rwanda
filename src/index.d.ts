export interface Village {
  id: string;
  name: string;
}

export interface Cell {
  id: string;
  name: string;
  villages: Village[];
}

export interface Sector {
  id: string;
  name: string;
  cells: Cell[];
}

export interface District {
  id: string;
  name: string;
  sectors: Sector[];
}

export interface Province {
  id: string;
  name: string;
  districts: District[];
}

export interface Dataset {
  country: string;
  version: string;
  provinces: Province[];
}

export interface DatasetIndex {
  provinces: Map<string, Province>;
  districts: Map<string, District>;
  sectors: Map<string, Sector>;
  cells: Map<string, Cell>;
}

export interface LoadedDataset {
  dataset: Readonly<Dataset>;
  index: DatasetIndex;
}

/** Returns the full, deep-frozen dataset. Loaded from disk once and cached. */
export function getDataset(): Readonly<Dataset>;

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

/** Loads (or returns the cached) dataset together with lookup indexes. */
export function loadDataset(): LoadedDataset;
