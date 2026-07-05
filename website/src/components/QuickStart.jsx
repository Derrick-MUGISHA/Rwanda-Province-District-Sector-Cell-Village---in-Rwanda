import { useState } from "react";

const TABS = [
  {
    id: "react",
    label: "React / JS",
    install: "npm install @derrick63/rwanda-admin-hierarchy",
    code: `import { getProvinces, getDistrictsByProvinceId } from "@derrick63/rwanda-admin-hierarchy";

function ProvinceSelect({ onChange }) {
  return (
    <select onChange={(e) => onChange(getDistrictsByProvinceId(e.target.value))}>
      {getProvinces().map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}`,
    note: "Works with Vite, Next.js and webpack. TypeScript definitions are included — the same import is fully typed in .ts/.tsx files.",
  },
  {
    id: "node",
    label: "Node / Express",
    install: "npm install @derrick63/rwanda-admin-hierarchy",
    code: `const { search, getPath, validateHierarchy } = require("@derrick63/rwanda-admin-hierarchy");

search("gitega");                 // fuzzy, diacritic-insensitive, all levels
getPath("village-11010103");      // village -> cell -> sector -> district -> province
validateHierarchy({
  province: "Kigali",
  district: "Nyarugenge",
  sector: "Gitega",
});                               // { valid: true, errors: [], match: {...} }

// Or run the bundled REST server: npm start (see API section below)`,
    note: "Zero runtime dependencies. The Express server is optional and ships in the repository.",
  },
  {
    id: "fastapi",
    label: "Python · FastAPI",
    install: 'pip install "rwanda-admin-hierarchy[fastapi]"',
    code: `from fastapi import FastAPI
from rwanda_admin_hierarchy.integrations.fastapi import create_router

app = FastAPI()
app.include_router(create_router(), prefix="/api/rwanda")

# GET /api/rwanda/provinces
# GET /api/rwanda/provinces/{id}/districts ... down to villages`,
    note: "The base package has no dependencies; the [fastapi] extra pulls in FastAPI only.",
  },
  {
    id: "django",
    label: "Python · Django",
    install: 'pip install "rwanda-admin-hierarchy[django]"',
    code: `# urls.py
from django.urls import include, path

urlpatterns = [
    path("api/rwanda/", include("rwanda_admin_hierarchy.integrations.django")),
]

# GET /api/rwanda/provinces
# GET /api/rwanda/provinces/<id>/districts ... down to villages`,
    note: "Plain function views returning JsonResponse — no middleware, models or migrations.",
  },
  {
    id: "java",
    label: "Java · Maven",
    install: "Published to GitHub Packages",
    code: `<repositories>
  <repository>
    <id>github</id>
    <url>https://maven.pkg.github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda</url>
  </repository>
</repositories>

<dependency>
  <groupId>io.github.derickmugisha</groupId>
  <artifactId>rwanda-admin-hierarchy</artifactId>
  <version>1.3.0</version>
</dependency>`,
    note: "GitHub Packages requires a GitHub token with read:packages in your settings.xml.",
  },
  {
    id: "flutter",
    label: "Dart · Flutter",
    install: "Add to pubspec.yaml",
    code: `dependencies:
  rwanda_admin_hierarchy:
    git:
      url: https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda.git
      path: dart`,
    note: "The dataset ships as a bundled asset — works offline, which matters on mobile.",
  },
];

export default function QuickStart() {
  const [active, setActive] = useState("react");
  const tab = TABS.find((t) => t.id === active);

  return (
    <section id="quick-start" className="section section--dark">
      <div className="section-inner">
        <p className="eyebrow">Quick start</p>
        <h2>One dataset, five ecosystems</h2>
        <p className="section-lead">
          The same hierarchy, the same ids and NISR codes, in whichever stack your project uses —
          frontend or backend.
        </p>

        <div className="tabs" role="tablist" aria-label="Choose your stack">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === active}
              className={t.id === active ? "tab tab--active" : "tab"}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-panel" role="tabpanel">
          <p className="tab-install">
            <code>{tab.install}</code>
          </p>
          <pre className="code-block">
            <code>{tab.code}</code>
          </pre>
          <p className="tab-note">{tab.note}</p>
        </div>
      </div>
    </section>
  );
}
