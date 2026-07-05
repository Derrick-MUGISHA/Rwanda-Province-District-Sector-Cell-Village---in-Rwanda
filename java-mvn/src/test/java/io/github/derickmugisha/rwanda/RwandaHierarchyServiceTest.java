package io.github.derickmugisha.rwanda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.github.derickmugisha.rwanda.model.District;
import io.github.derickmugisha.rwanda.model.Province;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class RwandaHierarchyServiceTest {
  private static RwandaHierarchyService service;

  @BeforeAll
  static void load() {
    service = RwandaHierarchyService.loadDefault();
  }

  @Test
  void datasetCarriesProvenanceMetadata() {
    assertEquals("Rwanda", service.getDataset().getCountry());
    assertEquals("2019-07", service.getDataset().getDataVersion());
    assertEquals("CC-BY-4.0", service.getDataset().getLicense());
    assertNotNull(service.getDataset().getSource());
  }

  @Test
  void hierarchyTraversesProvinceToVillage() {
    List<Province> provinces = service.getProvinces();
    assertEquals(5, provinces.size());

    Optional<List<District>> districts = service.getDistrictsByProvinceId(provinces.get(0).getId());
    assertTrue(districts.isPresent());
    assertFalse(districts.get().isEmpty());
  }

  @Test
  void unknownIdsReturnEmpty() {
    assertTrue(service.getDistrictsByProvinceId("no-such-id").isEmpty());
    assertTrue(service.getSectorsByDistrictId("no-such-id").isEmpty());
    assertTrue(service.getCellsBySectorId("no-such-id").isEmpty());
    assertTrue(service.getVillagesByCellId("no-such-id").isEmpty());
  }
}
