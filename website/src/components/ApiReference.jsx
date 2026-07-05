import { getPath, validateHierarchy } from "@derrick63/rwanda-admin-hierarchy";
import CodeBlock from "./CodeBlock.jsx";

const FUNCTION_GROUPS = [
  {
    title: "Traverse",
    items: [
      ["getProvinces()", "all five provinces"],
      ["getDistrictsByProvinceId(id)", "children of a province"],
      ["getSectorsByDistrictId(id)", "children of a district"],
      ["getCellsBySectorId(id)", "children of a sector"],
      ["getVillagesByCellId(id)", "children of a cell"],
      ["getAllDistricts() … getAllVillages()", "flat lists for dropdowns"],
    ],
  },
  {
    title: "Find",
    items: [
      ["search(query, { levels, limit })", "fuzzy name search; results carry their full path"],
      ["getById(id)", "resolve any id at any level"],
      ["getByCode(code)", 'NISR codes ("11", "11010103") and ISO 3166-2 ("RW-01")'],
      ["getPath(id)", "full ancestor chain for any id"],
    ],
  },
  {
    title: "Validate",
    items: [
      ["isValidHierarchy(parts)", "true when names/ids/codes form one chain"],
      ["validateHierarchy(parts)", "same, with errors and the matched chain"],
    ],
  },
  {
    title: "Provenance",
    items: [
      ["getDataMeta()", "source, license, data version, level counts"],
      ["resolveId(oldId)", "migrate ids across dataset versions"],
      ["getIdChanges()", "the raw id migration history"],
    ],
  },
];

const ENDPOINTS = [
  ["GET /api/meta", "dataset provenance and counts"],
  ["GET /api/provinces", "all provinces"],
  ["GET /api/provinces/:id/districts", "districts of a province"],
  ["GET /api/districts/:id/sectors", "sectors of a district"],
  ["GET /api/sectors/:id/cells", "cells of a sector"],
  ["GET /api/cells/:id/villages", "villages of a cell"],
  ["GET /api/search?q=…&level=…", "fuzzy search (Express server)"],
  ["GET /api/path/:id", "ancestor chain (Express server)"],
  ["GET /api/validate?province=…", "hierarchy validation (Express server)"],
];

export default function ApiReference() {
  const pathExample = JSON.stringify(getPath("village-11010103"), null, 2);
  const validateExample = JSON.stringify(
    validateHierarchy({ province: "Kigali", district: "Nyarugenge", sector: "Gitega" }),
    null,
    2
  );

  return (
    <section id="api" className="section section--light">
      <div className="section-inner">
        <p className="eyebrow">API reference</p>
        <h2>Small surface, whole country</h2>

        <div className="api-grid">
          <div>
            <h3>JavaScript functions</h3>
            {FUNCTION_GROUPS.map((group) => (
              <div key={group.title} className="api-group">
                <h4>{group.title}</h4>
                <ul className="api-list">
                  {group.items.map(([signature, description]) => (
                    <li key={signature}>
                      <code>{signature}</code>
                      <span>{description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <h3>REST endpoints</h3>
            <p className="api-note">
              Served by the bundled Express server (<code>npm start</code>) and, for the traversal
              routes, by the FastAPI and Django integrations under your chosen prefix.
            </p>
            <ul className="api-list api-list--endpoints">
              {ENDPOINTS.map(([endpoint, description]) => (
                <li key={endpoint}>
                  <code>{endpoint}</code>
                  <span>{description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="api-shapes">
          <h3>What comes back</h3>
          <p className="api-note">
            These two responses are generated in your browser by the package as this page renders —
            they cannot drift out of date.
          </p>
          <div className="api-shapes-grid">
            <CodeBlock
              language="json"
              filename={'getPath("village-11010103")'}
              code={pathExample}
            />
            <CodeBlock
              language="json"
              filename={'validateHierarchy({ province: "Kigali", … })'}
              code={validateExample}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
