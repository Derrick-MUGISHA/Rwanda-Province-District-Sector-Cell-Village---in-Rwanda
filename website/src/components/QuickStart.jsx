import { useState } from "react";
import CodeBlock, { CopyCommand } from "./CodeBlock.jsx";

const TABS = [
  {
    id: "react",
    label: "React / JS",
    install: "npm install @derrick63/rwanda-admin-hierarchy",
    filename: "AddressForm.jsx",
    language: "jsx",
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
    note: "Works with Vite, Next.js and webpack — no configuration. TypeScript definitions are included, so the same import is fully typed in .ts/.tsx files.",
  },
  {
    id: "node",
    label: "Node / Express",
    install: "npm install @derrick63/rwanda-admin-hierarchy",
    filename: "lookup.js",
    language: "javascript",
    code: `const { search, getPath, validateHierarchy } = require("@derrick63/rwanda-admin-hierarchy");

// Fuzzy, diacritic-insensitive search across all five levels
search("gitega");

// Reverse lookup: village -> cell -> sector -> district -> province
getPath("village-11010103");

// Validate a submitted address; accepts names, ids or NISR codes
validateHierarchy({
  province: "Kigali",
  district: "Nyarugenge",
  sector: "Gitega",
}); // { valid: true, errors: [], match: { ... } }`,
    note: "Zero runtime dependencies. A ready-made Express server with the same endpoints ships in the repository (npm start).",
  },
  {
    id: "fastapi",
    label: "Python · FastAPI",
    install: 'pip install "rwanda-admin-hierarchy[fastapi]"',
    filename: "main.py",
    language: "python",
    code: `from fastapi import FastAPI
from rwanda_admin_hierarchy.integrations.fastapi import create_router

app = FastAPI()
app.include_router(create_router(), prefix="/api/rwanda")

# GET /api/rwanda/provinces
# GET /api/rwanda/provinces/{id}/districts
# ... down to /api/rwanda/cells/{id}/villages`,
    note: "The base package has no dependencies; the [fastapi] extra pulls in FastAPI only. Unknown ids return HTTP 404.",
  },
  {
    id: "django",
    label: "Python · Django",
    install: 'pip install "rwanda-admin-hierarchy[django]"',
    filename: "urls.py",
    language: "python",
    code: `from django.urls import include, path

urlpatterns = [
    path("api/rwanda/", include("rwanda_admin_hierarchy.integrations.django")),
]

# GET /api/rwanda/provinces
# GET /api/rwanda/provinces/<id>/districts
# ... down to /api/rwanda/cells/<id>/villages`,
    note: "Plain function views returning JsonResponse — no middleware, models or migrations to add.",
  },
  {
    id: "java",
    label: "Java · Maven",
    install: "Published to GitHub Packages",
    filename: "pom.xml",
    language: "markup",
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
    filename: "pubspec.yaml",
    language: "yaml",
    code: `dependencies:
  rwanda_admin_hierarchy:
    git:
      url: https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda.git
      path: dart`,
    note: "The dataset ships as a bundled asset — works fully offline, which matters on mobile.",
  },
];

export default function QuickStart() {
  const [active, setActive] = useState("react");
  const tab = TABS.find((t) => t.id === active);

  return (
    <section id="stacks" className="section section--light">
      <div className="section-inner">
        <p className="eyebrow">Use it in your stack</p>
        <h2>One dataset, five ecosystems</h2>
        <p className="section-lead">
          Everything from <a href="#get-started">Get started</a> applies in every stack — the same
          hierarchy, ids and NISR codes on the frontend and the backend. Pick yours:
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
            {tab.install.includes(" install ") || tab.install.startsWith("pip") ? (
              <CopyCommand command={tab.install} />
            ) : (
              <span className="tab-install-hint">{tab.install}</span>
            )}
          </p>
          <CodeBlock language={tab.language} filename={tab.filename} code={tab.code} />
          <p className="tab-note">{tab.note}</p>
        </div>
      </div>
    </section>
  );
}
