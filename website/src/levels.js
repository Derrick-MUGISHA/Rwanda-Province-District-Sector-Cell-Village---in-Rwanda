// Display order and naming for the five administrative levels. Kinyarwanda
// first: it is what the levels are actually called on the ground.
export const LEVELS = [
  { key: "province", rw: "Intara", en: "Province", digits: 1 },
  { key: "district", rw: "Akarere", en: "District", digits: 2 },
  { key: "sector", rw: "Umurenge", en: "Sector", digits: 4 },
  { key: "cell", rw: "Akagari", en: "Cell", digits: 6 },
  { key: "village", rw: "Umudugudu", en: "Village", digits: 8 },
];

export function pathNames(path) {
  return LEVELS.filter(({ key }) => path && path[key]).map(({ key }) => path[key].name);
}
