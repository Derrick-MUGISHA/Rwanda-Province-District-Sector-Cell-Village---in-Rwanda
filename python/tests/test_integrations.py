import unittest

try:
    from fastapi.testclient import TestClient

    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False

try:
    import django

    HAS_DJANGO = True
except ImportError:
    HAS_DJANGO = False


class SummarizeTests(unittest.TestCase):
    def test_strips_child_collections(self):
        from rwanda_admin.integrations import summarize

        node = {"id": "x", "name": "X", "code": "1", "districts": [{"id": "d"}]}
        self.assertEqual(summarize(node), {"id": "x", "name": "X", "code": "1"})


@unittest.skipUnless(HAS_FASTAPI, "fastapi not installed")
class FastAPIIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        from fastapi import FastAPI

        from rwanda_admin.integrations.fastapi import create_router

        app = FastAPI()
        app.include_router(create_router(), prefix="/rw")
        cls.client = TestClient(app)

    def test_meta(self):
        meta = self.client.get("/rw/meta").json()
        self.assertEqual(meta["counts"]["provinces"], 5)

    def test_provinces_are_summarized(self):
        provinces = self.client.get("/rw/provinces").json()
        self.assertEqual(len(provinces), 5)
        self.assertNotIn("districts", provinces[0])

    def test_traversal_and_404(self):
        province_id = self.client.get("/rw/provinces").json()[0]["id"]
        districts = self.client.get(f"/rw/provinces/{province_id}/districts")
        self.assertEqual(districts.status_code, 200)
        self.assertTrue(districts.json())
        self.assertNotIn("sectors", districts.json()[0])
        missing = self.client.get("/rw/provinces/province-nope/districts")
        self.assertEqual(missing.status_code, 404)


@unittest.skipUnless(HAS_DJANGO, "django not installed")
class DjangoIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        from django.conf import settings

        if not settings.configured:
            settings.configure(
                DEBUG=True,
                ALLOWED_HOSTS=["testserver"],
                ROOT_URLCONF="rwanda_admin.integrations.django",
            )
            django.setup()
        from django.test import Client

        cls.client = Client()

    def test_meta(self):
        response = self.client.get("/meta")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["counts"]["provinces"], 5)

    def test_provinces_are_summarized(self):
        provinces = self.client.get("/provinces").json()
        self.assertEqual(len(provinces), 5)
        self.assertNotIn("districts", provinces[0])

    def test_traversal_and_404(self):
        province_id = self.client.get("/provinces").json()[0]["id"]
        districts = self.client.get(f"/provinces/{province_id}/districts")
        self.assertEqual(districts.status_code, 200)
        self.assertTrue(districts.json())
        missing = self.client.get("/provinces/province-nope/districts")
        self.assertEqual(missing.status_code, 404)


if __name__ == "__main__":
    unittest.main()
