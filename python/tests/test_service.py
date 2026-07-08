import unittest

import rwanda_admin as r


class ServiceTests(unittest.TestCase):
    def test_dataset_meta(self):
        meta = r.get_data_meta()
        self.assertEqual(meta["country"], "Rwanda")
        self.assertEqual(meta["dataVersion"], "2019-07")
        self.assertEqual(meta["license"], "CC-BY-4.0")
        self.assertIn("NISR", meta["source"])
        self.assertEqual(meta["counts"]["provinces"], 5)
        self.assertEqual(meta["counts"]["districts"], 30)
        self.assertEqual(meta["counts"]["sectors"], 416)
        self.assertEqual(meta["counts"]["villages"], 14816)

    def test_provinces(self):
        provinces = r.get_provinces()
        self.assertEqual(len(provinces), 5)
        for province in provinces:
            self.assertTrue(province["id"])
            self.assertTrue(province["name"])

    def test_hierarchy_traversal(self):
        province = r.get_provinces()[0]
        districts = r.get_districts_by_province_id(province["id"])
        self.assertTrue(districts)
        sectors = r.get_sectors_by_district_id(districts[0]["id"])
        self.assertTrue(sectors)
        cells = r.get_cells_by_sector_id(sectors[0]["id"])
        self.assertTrue(cells)
        villages = r.get_villages_by_cell_id(cells[0]["id"])
        self.assertTrue(villages)
        self.assertIn(villages[0]["nep"], ("GE", "SAS", "Microgrid"))

    def test_unknown_ids_return_none(self):
        self.assertIsNone(r.get_districts_by_province_id("no-such-id"))
        self.assertIsNone(r.get_sectors_by_district_id("no-such-id"))
        self.assertIsNone(r.get_cells_by_sector_id("no-such-id"))
        self.assertIsNone(r.get_villages_by_cell_id("no-such-id"))


if __name__ == "__main__":
    unittest.main()
