package io.github.derickmugisha.rwanda;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.derickmugisha.rwanda.model.Cell;
import io.github.derickmugisha.rwanda.model.District;
import io.github.derickmugisha.rwanda.model.Province;
import io.github.derickmugisha.rwanda.model.RwandaDataset;
import io.github.derickmugisha.rwanda.model.Sector;
import io.github.derickmugisha.rwanda.model.Village;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class RwandaHierarchyService {
  private final RwandaDataset dataset;
  private final Map<String, Province> provinceById;
  private final Map<String, District> districtById;
  private final Map<String, Sector> sectorById;
  private final Map<String, Cell> cellById;

  public RwandaHierarchyService(RwandaDataset dataset) {
    this.dataset = dataset;
    this.provinceById = new HashMap<>();
    this.districtById = new HashMap<>();
    this.sectorById = new HashMap<>();
    this.cellById = new HashMap<>();
    indexDataset();
  }

  public static RwandaHierarchyService loadDefault() {
    ObjectMapper mapper =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    try (InputStream input =
      RwandaHierarchyService.class.getResourceAsStream("/rwanda-administrative.json")) {
      if (input == null) {
        throw new IllegalStateException("Dataset resource not found: /rwanda-administrative.json");
      }
      RwandaDataset dataset = mapper.readValue(input, RwandaDataset.class);
      return new RwandaHierarchyService(dataset);
    } catch (IOException e) {
      throw new IllegalStateException("Failed to load Rwanda dataset.", e);
    }
  }

  private void indexDataset() {
    if (dataset.getProvinces() == null) {
      return;
    }

    for (Province province : dataset.getProvinces()) {
      provinceById.put(province.getId(), province);
      if (province.getDistricts() == null) {
        continue;
      }

      for (District district : province.getDistricts()) {
        districtById.put(district.getId(), district);
        if (district.getSectors() == null) {
          continue;
        }

        for (Sector sector : district.getSectors()) {
          sectorById.put(sector.getId(), sector);
          if (sector.getCells() == null) {
            continue;
          }

          for (Cell cell : sector.getCells()) {
            cellById.put(cell.getId(), cell);
          }
        }
      }
    }
  }

  public RwandaDataset getDataset() {
    return dataset;
  }

  public List<Province> getProvinces() {
    return dataset.getProvinces() == null ? Collections.emptyList() : dataset.getProvinces();
  }

  public Optional<List<District>> getDistrictsByProvinceId(String provinceId) {
    Province province = provinceById.get(provinceId);
    if (province == null) {
      return Optional.empty();
    }
    List<District> districts = province.getDistricts() == null
      ? Collections.emptyList()
      : province.getDistricts();
    return Optional.of(districts);
  }

  public Optional<List<Sector>> getSectorsByDistrictId(String districtId) {
    District district = districtById.get(districtId);
    if (district == null) {
      return Optional.empty();
    }
    List<Sector> sectors = district.getSectors() == null ? Collections.emptyList() : district.getSectors();
    return Optional.of(sectors);
  }

  public Optional<List<Cell>> getCellsBySectorId(String sectorId) {
    Sector sector = sectorById.get(sectorId);
    if (sector == null) {
      return Optional.empty();
    }
    List<Cell> cells = sector.getCells() == null ? Collections.emptyList() : sector.getCells();
    return Optional.of(cells);
  }

  public Optional<List<Village>> getVillagesByCellId(String cellId) {
    Cell cell = cellById.get(cellId);
    if (cell == null) {
      return Optional.empty();
    }
    List<Village> villages = cell.getVillages() == null ? Collections.emptyList() : cell.getVillages();
    return Optional.of(villages);
  }
}
package io.github.derickmugisha.rwanda;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.derickmugisha.rwanda.model.Cell;
import io.github.derickmugisha.rwanda.model.District;
import io.github.derickmugisha.rwanda.model.Province;
import io.github.derickmugisha.rwanda.model.RwandaDataset;
import io.github.derickmugisha.rwanda.model.Sector;
import io.github.derickmugisha.rwanda.model.Village;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class RwandaHierarchyService {
  private final RwandaDataset dataset;
  private final Map<String, Province> provinceById;
  private final Map<String, District> districtById;
  private final Map<String, Sector> sectorById;
  private final Map<String, Cell> cellById;

  public RwandaHierarchyService(RwandaDataset dataset) {
    this.dataset = dataset;
    this.provinceById = new HashMap<>();
    this.districtById = new HashMap<>();
    this.sectorById = new HashMap<>();
    this.cellById = new HashMap<>();
    indexDataset();
  }

  public static RwandaHierarchyService loadDefault() {
    ObjectMapper mapper = new ObjectMapper()
      .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    try (InputStream input = RwandaHierarchyService.class.getResourceAsStream("/rwanda-administrative.json")) {
      if (input == null) {
        throw new IllegalStateException("Dataset resource not found: /rwanda-administrative.json");
      }
      RwandaDataset dataset = mapper.readValue(input, RwandaDataset.class);
      return new RwandaHierarchyService(dataset);
    } catch (IOException e) {
      throw new IllegalStateException("Failed to load Rwanda dataset.", e);
    }
  }

  private void indexDataset() {
    if (dataset.getProvinces() == null) {
      return;
    }

    for (Province province : dataset.getProvinces()) {
      provinceById.put(province.getId(), province);
      if (province.getDistricts() == null) {
        continue;
      }

      for (District district : province.getDistricts()) {
        districtById.put(district.getId(), district);
        if (district.getSectors() == null) {
          continue;
        }

        for (Sector sector : district.getSectors()) {
          sectorById.put(sector.getId(), sector);
          if (sector.getCells() == null) {
            continue;
          }

          for (Cell cell : sector.getCells()) {
            cellById.put(cell.getId(), cell);
          }
        }
      }
    }
  }

  public RwandaDataset getDataset() {
    return dataset;
  }

  public List<Province> getProvinces() {
    return dataset.getProvinces() == null ? Collections.emptyList() : dataset.getProvinces();
  }

  public Optional<List<District>> getDistrictsByProvinceId(String provinceId) {
    Province province = provinceById.get(provinceId);
    return province == null
      ? Optional.empty()
      : Optional.ofNullable(province.getDistricts()).or(() -> Optional.of(Collections.emptyList()));
  }

  public Optional<List<Sector>> getSectorsByDistrictId(String districtId) {
    District district = districtById.get(districtId);
    return district == null
      ? Optional.empty()
      : Optional.ofNullable(district.getSectors()).or(() -> Optional.of(Collections.emptyList()));
  }

  public Optional<List<Cell>> getCellsBySectorId(String sectorId) {
    Sector sector = sectorById.get(sectorId);
    return sector == null
      ? Optional.empty()
      : Optional.ofNullable(sector.getCells()).or(() -> Optional.of(Collections.emptyList()));
  }

  public Optional<List<Village>> getVillagesByCellId(String cellId) {
    Cell cell = cellById.get(cellId);
    return cell == null
      ? Optional.empty()
      : Optional.ofNullable(cell.getVillages()).or(() -> Optional.of(Collections.emptyList()));
  }
}
