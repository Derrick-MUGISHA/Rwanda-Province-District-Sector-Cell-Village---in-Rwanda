import CodeBlock, { CopyCommand } from "./CodeBlock.jsx";
import { Callout } from "./ui/callout.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.jsx";
import { STACKS, useStack } from "../stack-context.jsx";

const REPO_URL =
  "https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda";

/** A numbered part of a guide. Parts are a real sequence: follow them in order. */
function Part({ n, title, children }) {
  return (
    <div className="mt-9">
      <h3 className="mb-2 flex items-baseline gap-3 text-[1.25rem]">
        <span className="font-mono text-[0.95rem] font-semibold text-sundeep">{String(n).padStart(2, "0")}</span>
        {title}
      </h3>
      <div className="max-w-[46rem] [&>p]:mb-3">{children}</div>
    </div>
  );
}

function Endpoints({ rows }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-leafline bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-leafline text-left">
            <th className="px-4 py-2.5 font-semibold">Endpoint</th>
            <th className="px-4 py-2.5 font-semibold">Returns</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([endpoint, returns]) => (
            <tr key={endpoint} className="border-b border-leafline/60 last:border-0">
              <td className="whitespace-nowrap px-4 py-2 font-mono text-[0.82rem]">{endpoint}</td>
              <td className="px-4 py-2 text-forest">{returns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------ JavaScript */

function JsGuide() {
  return (
    <>
      <Callout kind="learn">
        <ul>
          <li>Build a five-level cascading address form in React</li>
          <li>Validate submitted addresses and show precise errors</li>
          <li>Add typo-tolerant search-as-you-type</li>
          <li>Use the bundled TypeScript types</li>
          <li>Serve the dataset over HTTP with Express</li>
        </ul>
      </Callout>

      <Part n={1} title="Install">
        <p>
          <CopyCommand command="npm install rwanda-admin" />
        </p>
        <p>
          The package is CommonJS with zero runtime dependencies and works unchanged in Node and
          in browser bundlers (Vite, Next.js, webpack, CRA). The full dataset ships inside — no
          API key, no network, no async loading step.
        </p>
      </Part>

      <Part n={2} title="Build the cascading address form">
        <p>
          The pattern: each level's options come from the id selected one level above, and
          selecting a level clears everything below it. This component is complete — paste it
          into your project and it works:
        </p>
        <CodeBlock
          language="jsx"
          filename="AddressForm.jsx"
          code={`import { useState } from "react";
import {
  getProvinces,
  getDistrictsByProvinceId,
  getSectorsByDistrictId,
  getCellsBySectorId,
  getVillagesByCellId,
} from "rwanda-admin";

const LEVELS = ["province", "district", "sector", "cell", "village"];
const CHILDREN_OF = {
  district: getDistrictsByProvinceId,
  sector: getSectorsByDistrictId,
  cell: getCellsBySectorId,
  village: getVillagesByCellId,
};

export default function AddressForm({ onSubmit }) {
  const [address, setAddress] = useState({});

  const optionsFor = (level, i) => {
    if (i === 0) return getProvinces();
    const parentId = address[LEVELS[i - 1]];
    return parentId ? CHILDREN_OF[level](parentId) : null;
  };

  function select(level, id) {
    // Keep ancestors, drop this level's old value and every level below it.
    const next = {};
    for (const l of LEVELS) {
      if (l === level) break;
      next[l] = address[l];
    }
    setAddress({ ...next, [level]: id });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(address); }}>
      {LEVELS.map((level, i) => {
        const options = optionsFor(level, i);
        return (
          <select
            key={level}
            required
            disabled={!options}
            value={address[level] ?? ""}
            onChange={(e) => select(level, e.target.value)}
          >
            <option value="">Select a {level}…</option>
            {(options ?? []).map((node) => (
              <option key={node.id} value={node.id}>{node.name}</option>
            ))}
          </select>
        );
      })}
      <button>Save address</button>
    </form>
  );
}`}
        />
        <Callout kind="note">
          <p>
            The <a href="#demo">live demo</a> at the top of this page is this exact pattern — and
            unknown ids return <code>null</code> rather than throwing, so a stale id from a saved
            draft can never crash the form.
          </p>
        </Callout>
      </Part>

      <Part n={3} title="Validate on submit">
        <p>
          Never trust a submitted address, even from your own form — drafts go stale and ids get
          edited. <code>validateHierarchy()</code> accepts the ids straight from the form state
          (or names, or NISR codes) and tells you exactly which level broke:
        </p>
        <CodeBlock
          language="javascript"
          filename="submit.js"
          code={`import { validateHierarchy } from "rwanda-admin";

function handleSubmit(address) {
  const result = validateHierarchy(address);
  if (!result.valid) {
    // e.g. ["\\"Gitega\\" is not a sector of district \\"Gasabo\\"."]
    return { status: 422, errors: result.errors };
  }
  // result.match holds the resolved chain — store canonical ids, not labels.
  return save({
    villageId: result.match.village.id,
    nisrCode: result.match.village.code,
  });
}`}
        />
      </Part>

      <Part n={4} title="Search-as-you-type">
        <p>
          For a one-box address field, <code>search()</code> is case-, diacritic- and
          typo-tolerant, and every hit carries its full ancestor path, so you can render
          disambiguating context (there are 7 villages named "Kigarama" in one district alone):
        </p>
        <CodeBlock
          language="jsx"
          filename="VillageSearch.jsx"
          code={`import { useDeferredValue, useMemo, useState } from "react";
import { search } from "rwanda-admin";

export default function VillageSearch({ onPick }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query); // keeps typing smooth
  const hits = useMemo(
    () => (deferred.trim() ? search(deferred, { levels: ["village"], limit: 10 }) : []),
    [deferred]
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {hits.map((hit) => (
          <li key={hit.id} onClick={() => onPick(hit)}>
            {hit.name} — {hit.path.sector.name}, {hit.path.district.name}
          </li>
        ))}
      </ul>
    </>
  );
}`}
        />
      </Part>

      <Part n={5} title="TypeScript">
        <p>
          Type definitions ship with the package — no <code>@types/…</code> install. Every
          function, node shape and option is typed:
        </p>
        <CodeBlock
          language="typescript"
          filename="typed.ts"
          code={`import {
  getProvinces,
  getPath,
  search,
  type Province,
  type SearchResult,
  type HierarchyPath,
  type Level,
} from "rwanda-admin";

const provinces: Province[] = getProvinces();
const hits: SearchResult[] = search("gitega", { levels: ["sector"], limit: 5 });
const path: HierarchyPath | null = getPath(hits[0].id);

// Level is the union "province" | "district" | "sector" | "cell" | "village"
function label(level: Level): string {
  return { province: "Intara", district: "Akarere", sector: "Umurenge",
           cell: "Akagari", village: "Umudugudu" }[level];
}`}
        />
      </Part>

      <Part n={6} title="Serve it over HTTP">
        <p>
          To keep the dataset off your client bundle, expose it from your own Express app — every
          function is synchronous, so handlers stay one-liners. Strip child collections from list
          responses, exactly like the Python integrations do:
        </p>
        <CodeBlock
          language="javascript"
          filename="server.js"
          code={`const express = require("express");
const {
  getProvinces,
  getDistrictsByProvinceId,
  search,
  getPath,
} = require("rwanda-admin");

const slim = ({ districts, sectors, cells, villages, ...node }) => node;
const app = express();

app.get("/api/provinces", (_req, res) => res.json(getProvinces().map(slim)));

app.get("/api/provinces/:id/districts", (req, res) => {
  const districts = getDistrictsByProvinceId(req.params.id);
  if (!districts) return res.status(404).json({ error: "Unknown province id" });
  res.json(districts.map(slim));
});

app.get("/api/search", (req, res) => res.json(search(req.query.q ?? "", { limit: 10 })));
app.get("/api/path/:id", (req, res) => res.json(getPath(req.params.id)));

app.listen(3000);`}
        />
        <p>
          Prefer zero code? The repository ships a hardened Express server (helmet, CORS, rate
          limiting) with these endpoints ready:{" "}
          <a href={REPO_URL}>clone the repo</a> and run <code>npm start</code>.
        </p>
      </Part>

      <Callout kind="pitfall">
        <p>
          Importing the lookup API puts the dataset in your client bundle: ~3.1 MB raw, ~340 KB
          gzipped over the wire. That is fine for an admin tool or a form-heavy app; for a
          landing page it is not. Lazy-load the route (<code>React.lazy</code>), import a single
          province (<code>…/data/provinces/umujyi-wa-kigali.json</code>), or serve it over HTTP
          as in part 06.
        </p>
      </Callout>
    </>
  );
}

/* ---------------------------------------------------------------- Python */

function PythonGuide() {
  return (
    <>
      <Callout kind="learn">
        <ul>
          <li>Traverse the hierarchy from plain Python</li>
          <li>Mount ready-made REST endpoints in FastAPI</li>
          <li>Do the same in Django with one include()</li>
          <li>Feed a React or mobile frontend from those endpoints</li>
        </ul>
      </Callout>

      <Part n={1} title="Install">
        <p>
          The base package has <strong>zero dependencies</strong>; extras pull in only the
          framework you use:
        </p>
        <p>
          <CopyCommand command="pip install rwanda-admin" />
        </p>
        <p>
          <CopyCommand command='pip install "rwanda-admin[fastapi]"' />
        </p>
        <p>
          <CopyCommand command='pip install "rwanda-admin[django]"' />
        </p>
      </Part>

      <Part n={2} title="Traverse from plain Python">
        <p>
          The core API mirrors the JavaScript traversal functions in snake_case. Every function
          returns plain dicts and lists (loaded once, then cached); unknown ids return{" "}
          <code>None</code>:
        </p>
        <CodeBlock
          language="python"
          filename="traverse.py"
          code={`from rwanda_admin import (
    get_data_meta,
    get_provinces,
    get_districts_by_province_id,
    get_sectors_by_district_id,
    get_cells_by_sector_id,
    get_villages_by_cell_id,
)

meta = get_data_meta()
print(meta["counts"])   # {'provinces': 5, ..., 'villages': 14816}

for province in get_provinces():
    districts = get_districts_by_province_id(province["id"])
    print(province["name"], "->", len(districts), "districts")

assert get_districts_by_province_id("province-nope") is None`}
        />
        <Callout kind="note">
          <p>
            The Python package covers traversal and metadata today. Fuzzy search, code lookups
            and hierarchy validation currently ship in the JavaScript package — if your backend
            needs them, front the JS Express server or keep validation in the client.
          </p>
        </Callout>
      </Part>

      <Part n={3} title="FastAPI: mount the router">
        <p>
          One factory call gives you the read-only hierarchy API under any prefix you choose:
        </p>
        <CodeBlock
          language="python"
          filename="main.py"
          code={`from fastapi import FastAPI
from rwanda_admin.integrations.fastapi import create_router

app = FastAPI(title="My app")
app.include_router(create_router(), prefix="/api/rwanda", tags=["rwanda"])`}
        />
        <p>
          <CopyCommand command="uvicorn main:app --reload" />
        </p>
        <Endpoints
          rows={[
            ["GET /api/rwanda/meta", "dataset provenance, license and level counts"],
            ["GET /api/rwanda/provinces", "all 5 provinces"],
            ["GET /api/rwanda/provinces/{id}/districts", "districts of a province, or 404"],
            ["GET /api/rwanda/districts/{id}/sectors", "sectors of a district, or 404"],
            ["GET /api/rwanda/sectors/{id}/cells", "cells of a sector, or 404"],
            ["GET /api/rwanda/cells/{id}/villages", "villages of a cell, or 404"],
          ]}
        />
        <p>Try it:</p>
        <CodeBlock
          language="bash"
          filename="curl"
          code={`$ curl -s localhost:8000/api/rwanda/provinces | python -m json.tool
[
    { "id": "province-umujyi-wa-kigali", "name": "Umujyi wa Kigali" },
    { "id": "province-amajyepfo",        "name": "Amajyepfo" },
    ...
]

$ curl -s -o /dev/null -w "%{http_code}" localhost:8000/api/rwanda/provinces/nope/districts
404`}
        />
        <Callout kind="note">
          <p>
            List responses deliberately omit child collections — a full province subtree is
            megabytes of JSON, while an address picker only ever needs one level at a time.
            Because it is a normal APIRouter, the endpoints appear in your OpenAPI docs at{" "}
            <code>/docs</code> automatically.
          </p>
        </Callout>
      </Part>

      <Part n={4} title="Django: one include()">
        <p>
          The Django integration is a plain urlconf — no app to register, no models, no
          migrations, nothing in <code>INSTALLED_APPS</code>:
        </p>
        <CodeBlock
          language="python"
          filename="urls.py"
          code={`from django.urls import include, path

urlpatterns = [
    # ... your other routes
    path("api/rwanda/", include("rwanda_admin.integrations.django")),
]`}
        />
        <p>
          Same six endpoints, same slim responses, same 404 behavior as FastAPI —{" "}
          <code>GET /api/rwanda/provinces</code>, <code>…/provinces/&lt;id&gt;/districts</code>,
          down to villages. The views are decorated with <code>require_GET</code>, so writes are
          rejected with 405.
        </p>
      </Part>

      <Part n={5} title="Feed your frontend">
        <p>
          With either framework serving the endpoints, a frontend fetches one level at a time —
          the client bundle stays dataset-free:
        </p>
        <CodeBlock
          language="jsx"
          filename="useDistricts.js"
          code={`import { useEffect, useState } from "react";

export function useDistricts(provinceId) {
  const [districts, setDistricts] = useState([]);
  useEffect(() => {
    if (!provinceId) return setDistricts([]);
    fetch(\`/api/rwanda/provinces/\${provinceId}/districts\`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setDistricts);
  }, [provinceId]);
  return districts;
}`}
        />
      </Part>
    </>
  );
}

/* ------------------------------------------------------------------ Java */

function JavaGuide() {
  return (
    <>
      <Callout kind="learn">
        <ul>
          <li>Authenticate Maven or Gradle against GitHub Packages</li>
          <li>Load the bundled dataset and traverse it</li>
          <li>Handle unknown ids idiomatically with Optional</li>
        </ul>
      </Callout>

      <Part n={1} title="Authenticate to GitHub Packages">
        <p>
          The Java package is published to GitHub Packages, which requires any GitHub account
          token with the <code>read:packages</code> scope (a free classic token works). Add the
          server to <code>~/.m2/settings.xml</code>:
        </p>
        <CodeBlock
          language="markup"
          filename="~/.m2/settings.xml"
          code={`<settings>
  <servers>
    <server>
      <id>github</id>
      <username>YOUR_GITHUB_USERNAME</username>
      <!-- a personal access token with read:packages -->
      <password>ghp_XXXXXXXXXXXXXXXXXXXX</password>
    </server>
  </servers>
</settings>`}
        />
        <Callout kind="pitfall">
          <p>
            The <code>&lt;id&gt;github&lt;/id&gt;</code> here must match the repository id in
            your pom exactly — a mismatch produces a 401 that looks like a bad token.
          </p>
        </Callout>
      </Part>

      <Part n={2} title="Add the dependency">
        <CodeBlock
          language="markup"
          filename="pom.xml"
          code={`<repositories>
  <repository>
    <id>github</id>
    <url>https://maven.pkg.github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda</url>
  </repository>
</repositories>

<dependencies>
  <dependency>
    <groupId>io.github.derickmugisha</groupId>
    <artifactId>rwanda-admin</artifactId>
    <version>1.3.0</version>
  </dependency>
</dependencies>`}
        />
        <p>Using Gradle instead:</p>
        <CodeBlock
          language="groovy"
          filename="build.gradle"
          code={`repositories {
    maven {
        url = uri("https://maven.pkg.github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda")
        credentials {
            username = System.getenv("GITHUB_ACTOR")
            password = System.getenv("GITHUB_TOKEN") // read:packages
        }
    }
}

dependencies {
    implementation "io.github.derickmugisha:rwanda-admin:1.3.0"
}`}
        />
      </Part>

      <Part n={3} title="Load once, traverse anywhere">
        <p>
          <code>loadDefault()</code> reads the dataset bundled inside the JAR (Jackson does the
          parsing — it is the package's only dependency). Load it once at startup and share the
          instance; after loading, reads are lock-free:
        </p>
        <CodeBlock
          language="java"
          filename="RwandaLookup.java"
          code={`import io.github.derickmugisha.rwanda.RwandaHierarchyService;
import io.github.derickmugisha.rwanda.model.District;
import io.github.derickmugisha.rwanda.model.Province;

import java.util.List;
import java.util.Optional;

public class RwandaLookup {
  private static final RwandaHierarchyService RWANDA = RwandaHierarchyService.loadDefault();

  public static void main(String[] args) {
    List<Province> provinces = RWANDA.getProvinces();
    provinces.forEach(p -> System.out.println(p.getName()));

    // Unknown ids come back as Optional.empty() — no nulls, no exceptions.
    Optional<List<District>> districts =
        RWANDA.getDistrictsByProvinceId("province-umujyi-wa-kigali");

    districts.ifPresentOrElse(
        list -> list.forEach(d -> System.out.println("  " + d.getName())),
        () -> System.out.println("No such province"));
  }
}`}
        />
        <p>
          The traversal surface matches the other languages: <code>getProvinces()</code>,{" "}
          <code>getDistrictsByProvinceId</code>, <code>getSectorsByDistrictId</code>,{" "}
          <code>getCellsBySectorId</code>, <code>getVillagesByCellId</code>, plus{" "}
          <code>getDataset()</code> for the whole tree. Model classes are standard beans
          (<code>getId()</code>, <code>getName()</code>, children accessors), so they serialize
          cleanly through Jackson in a Spring controller.
        </p>
        <Callout kind="note">
          <p>
            Building a REST API in Spring? Return the nodes minus their child collections for
            list endpoints (a <code>record Slim(String id, String name)</code> projection is
            enough) — the same convention the JS and Python servers use.
          </p>
        </Callout>
      </Part>
    </>
  );
}

/* ------------------------------------------------------------------ Dart */

function DartGuide() {
  return (
    <>
      <Callout kind="learn">
        <ul>
          <li>Add the Flutter package from this repository</li>
          <li>Load the bundled dataset asynchronously, once</li>
          <li>Build a cascading dropdown form widget</li>
          <li>Read official NISR codes from village ids</li>
        </ul>
      </Callout>

      <Part n={1} title="Install">
        <p>Add the git dependency (the package lives in this repository's dart/ directory):</p>
        <CodeBlock
          language="yaml"
          filename="pubspec.yaml"
          code={`dependencies:
  rwanda_admin:
    git:
      url: https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda.git
      path: dart`}
        />
        <p>Or from the command line:</p>
        <p>
          <CopyCommand command="flutter pub add rwanda_admin --git-url=https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda.git --git-path=dart" />
        </p>
      </Part>

      <Part n={2} title="Load once">
        <p>
          The dataset ships as a Flutter asset inside the package, so{" "}
          <code>RwandaAdminHierarchy.load()</code> is async (it reads from the asset bundle) but
          needs no network. Load it once — at startup or behind a{" "}
          <code>FutureBuilder</code> — and pass the instance down:
        </p>
        <CodeBlock
          language="dart"
          filename="load.dart"
          code={`import 'package:rwanda_admin/rwanda_admin.dart';

late final RwandaAdminHierarchy rwanda;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized(); // asset bundle needs this
  rwanda = await RwandaAdminHierarchy.load();
  print(rwanda.provinces.length); // 5
  runApp(const MyApp());
}`}
        />
      </Part>

      <Part n={3} title="Cascading dropdowns">
        <p>
          Same pattern as every other stack: children come from the parent id, and picking a
          level resets the levels below it. Lookups return <code>null</code> for unknown ids:
        </p>
        <CodeBlock
          language="dart"
          filename="address_form.dart"
          code={`class AddressForm extends StatefulWidget {
  const AddressForm({super.key, required this.rwanda});
  final RwandaAdminHierarchy rwanda;

  @override
  State<AddressForm> createState() => _AddressFormState();
}

class _AddressFormState extends State<AddressForm> {
  Province? province;
  District? district;
  Sector? sector;
  Cell? cell;
  Village? village;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      DropdownButtonFormField<Province>(
        value: province,
        hint: const Text('Intara · Province'),
        items: [
          for (final p in widget.rwanda.provinces)
            DropdownMenuItem(value: p, child: Text(p.name)),
        ],
        onChanged: (p) => setState(() {
          province = p;
          district = null; sector = null; cell = null; village = null;
        }),
      ),
      DropdownButtonFormField<District>(
        value: district,
        hint: const Text('Akarere · District'),
        items: [
          for (final d in province?.districts ?? <District>[])
            DropdownMenuItem(value: d, child: Text(d.name)),
        ],
        onChanged: (d) => setState(() {
          district = d;
          sector = null; cell = null; village = null;
        }),
      ),
      // sectors, cells and villages follow the same shape:
      // district?.sectors, sector?.cells, cell?.villages
    ]);
  }
}`}
        />
      </Part>

      <Part n={4} title="NISR codes and offline use">
        <p>
          Village ids embed the official 8-digit NISR code, and the model exposes it directly —
          useful when submitting to government or telecom systems:
        </p>
        <CodeBlock
          language="dart"
          filename="codes.dart"
          code={`final villages = rwanda.villagesByCellId(cell.id);
for (final v in villages ?? <Village>[]) {
  print('\${v.name}: \${v.code}'); // e.g. Iterambere: 11010103
}`}
        />
        <Callout kind="note">
          <p>
            Because the dataset is a bundled asset, everything on this page works with airplane
            mode on — worth knowing for field-work apps that register locations in rural areas.
          </p>
        </Callout>
      </Part>
    </>
  );
}

/* ------------------------------------------------------------------------ */

const GUIDES = {
  js: JsGuide,
  python: PythonGuide,
  java: JavaGuide,
  dart: DartGuide,
};

export default function Guides() {
  const [stack, setStack] = useStack();

  return (
    <section id="stacks" className="section section--light section--ruled">
      <div className="section-inner">
        <p className="eyebrow">Integration guides</p>
        <h2>Wire it into your project, end to end</h2>
        <p className="section-lead">
          Not overviews — each guide takes one stack from installation to a working, validated
          address flow, with the sharp edges called out. Your choice here follows you across the
          page, including in the live demo.
        </p>

        <Tabs value={stack} onValueChange={setStack}>
          <TabsList aria-label="Choose your stack">
            {STACKS.map(({ id, label }) => (
              <TabsTrigger key={id} value={id}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {STACKS.map(({ id }) => {
            const Guide = GUIDES[id];
            return (
              <TabsContent key={id} value={id}>
                <Guide />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
