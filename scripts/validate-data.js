const { loadDataset } = require("../src/data-store");

function fail(errors) {
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

function pushDuplicateNameError(errors, items, scopeName) {
  const seenNames = new Set();
  for (const item of items) {
    const normalizedName = item.name.trim().toLowerCase();
    if (seenNames.has(normalizedName)) {
      errors.push(`Duplicate name "${item.name}" in ${scopeName}`);
    } else {
      seenNames.add(normalizedName);
    }
  }
}

function validate() {
  const { dataset } = loadDataset();
  const errors = [];
  const globalIds = new Set();

  if (!dataset.country || !dataset.version || !Array.isArray(dataset.provinces)) {
    errors.push("Root object must contain country, version and provinces");
    return fail(errors);
  }

  for (const province of dataset.provinces) {
    if (!province.id || !province.name || !Array.isArray(province.districts)) {
      errors.push(`Invalid province object for "${province.name || "unknown"}"`);
      continue;
    }
    if (globalIds.has(province.id)) {
      errors.push(`Duplicate ID: ${province.id}`);
    }
    globalIds.add(province.id);

    pushDuplicateNameError(errors, province.districts, `province ${province.name}`);

    for (const district of province.districts) {
      if (!district.id || !district.name || !Array.isArray(district.sectors)) {
        errors.push(`Invalid district object under province "${province.name}"`);
        continue;
      }
      if (globalIds.has(district.id)) {
        errors.push(`Duplicate ID: ${district.id}`);
      }
      globalIds.add(district.id);

      pushDuplicateNameError(errors, district.sectors, `district ${district.name}`);

      for (const sector of district.sectors) {
        if (!sector.id || !sector.name || !Array.isArray(sector.cells)) {
          errors.push(`Invalid sector object under district "${district.name}"`);
          continue;
        }
        if (globalIds.has(sector.id)) {
          errors.push(`Duplicate ID: ${sector.id}`);
        }
        globalIds.add(sector.id);

        pushDuplicateNameError(errors, sector.cells, `sector ${sector.name}`);

        for (const cell of sector.cells) {
          if (!cell.id || !cell.name || !Array.isArray(cell.villages)) {
            errors.push(`Invalid cell object under sector "${sector.name}"`);
            continue;
          }
          if (globalIds.has(cell.id)) {
            errors.push(`Duplicate ID: ${cell.id}`);
          }
          globalIds.add(cell.id);

          pushDuplicateNameError(errors, cell.villages, `cell ${cell.name}`);

          for (const village of cell.villages) {
            if (!village.id || !village.name) {
              errors.push(`Invalid village in cell "${cell.name}"`);
              continue;
            }
            if (globalIds.has(village.id)) {
              errors.push(`Duplicate ID: ${village.id}`);
            }
            globalIds.add(village.id);
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    fail(errors);
  }

  console.log("Dataset validation passed.");
  console.log(`Provinces: ${dataset.provinces.length}`);
}

validate();
