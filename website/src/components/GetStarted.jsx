import { getProvinces, validateHierarchy } from "rwanda-admin";
import CodeBlock, { PmCommand } from "./CodeBlock.jsx";

function Step({ n, title, children }) {
  return (
    <article className="step" id={`step-${n}`}>
      <div className="step-marker" aria-hidden="true">
        {n}
      </div>
      <div className="step-body">
        <h3>{title}</h3>
        {children}
      </div>
    </article>
  );
}

/** First lookup, shown with its real output (computed live, truncated). */
function provincesOutput() {
  const slim = getProvinces().map(({ id, name, code, isoCode }) => ({ id, name, code, isoCode }));
  return JSON.stringify(slim.slice(0, 2), null, 2).replace(/\n\]$/, ",\n  … 3 more provinces\n]");
}

export default function GetStarted() {
  const badValidation = JSON.stringify(
    validateHierarchy({ province: "Kigali", district: "Gasabo", sector: "Gitega" }),
    null,
    2
  );

  return (
    <section id="get-started" className="section section--dark section--ruled">
      <div className="section-inner">
        <p className="eyebrow">Get started</p>
        <h2>From zero to a validated address, in five steps</h2>
        <p className="section-lead">
          Rwanda's territory is one tree: Intara (province) › Akarere (district) › Umurenge
          (sector) › Akagari (cell) › Umudugudu (village). Every function in this package is a
          lookup into that tree. Follow the steps in order — each one builds on the last.
        </p>

        <Step n={1} title="Install the package">
          <p>
            One dependency, nothing else — the whole dataset ships inside it, so there are no API
            keys and no network calls.
          </p>
          <p>
            <PmCommand />
          </p>
          <p className="step-aside">
            npm, yarn and pnpm all install the same package from the npm registry. Using
            Python, Java or Flutter instead? The same steps apply — grab your install command
            from the <a href="#stacks">integration guides</a> below.
          </p>
        </Step>

        <Step n={2} title="Make your first lookup">
          <p>
            Start at the top of the tree. <code>getProvinces()</code> returns all five provinces,
            each with its id, official NISR code and ISO 3166-2 code:
          </p>
          <CodeBlock
            language="javascript"
            filename="first-lookup.js"
            code={`import { getProvinces } from "rwanda-admin";

const provinces = getProvinces();
console.log(provinces.length); // 5`}
          />
          <CodeBlock language="json" filename="output (live)" code={provincesOutput()} />
        </Step>

        <Step n={3} title="Drill down, level by level">
          <p>
            Every node's children are one call away. Feed the id a user selected into the next
            level's function — that is the whole pattern behind a cascading address form:
          </p>
          <CodeBlock
            language="javascript"
            filename="drill-down.js"
            code={`import {
  getDistrictsByProvinceId,
  getSectorsByDistrictId,
  getCellsBySectorId,
  getVillagesByCellId,
} from "rwanda-admin";

const districts = getDistrictsByProvinceId("province-umujyi-wa-kigali");
const sectors = getSectorsByDistrictId(districts[0].id);
const cells = getCellsBySectorId(sectors[0].id);
const villages = getVillagesByCellId(cells[0].id);
// Unknown ids return null — no exceptions to catch.`}
          />
          <p className="step-aside">
            The <a href="#demo">live demo</a> above is exactly this code wired to five{" "}
            <code>&lt;select&gt;</code> elements — and it shows you the calls it makes as you
            click.
          </p>
        </Step>

        <Step n={4} title="Validate what the user submitted">
          <p>
            Forms lie. <code>validateHierarchy()</code> checks that the submitted levels form one
            consistent chain — and it accepts names, ids or NISR codes interchangeably. Here is a
            plausible-looking address that is actually wrong (Gitega sector is in Nyarugenge, not
            Gasabo), caught with a precise error:
          </p>
          <CodeBlock
            language="javascript"
            filename="validate.js"
            code={`import { validateHierarchy } from "rwanda-admin";

validateHierarchy({
  province: "Kigali",
  district: "Nyarugenge",
  sector: "Gitega",
}); // → { valid: true, errors: [], match: { … } }

validateHierarchy({
  province: "Kigali",
  district: "Gasabo",   // wrong parent for Gitega
  sector: "Gitega",
});`}
          />
          <CodeBlock language="json" filename="output (live)" code={badValidation} />
        </Step>

        <Step n={5} title="Go further: search, codes, ancestry">
          <p>
            Once the basics work, three tools cover the advanced cases: fuzzy search for
            free-text input, code lookups for interoperating with government systems, and
            ancestry for turning any id back into a full address.
          </p>
          <CodeBlock
            language="javascript"
            filename="advanced.js"
            code={`import { search, getByCode, getPath, resolveId } from "rwanda-admin";

// Typo- and diacritic-tolerant search across all 17,409 places
search("nyarugengye", { levels: ["district"], limit: 3 });

// NISR codes and ISO 3166-2 — the codes other systems speak
getByCode("11");       // Nyarugenge district
getByCode("RW-01");    // City of Kigali

// Any id back to its full chain: village -> ... -> province
getPath("village-11010103");

// Ids from an older dataset version? Migrate them.
resolveId("some-old-id");`}
          />
          <p className="step-aside">
            Full signatures for every function are in the{" "}
            <a href="#api">API reference</a>. To serve this data over HTTP instead of bundling
            it, jump to the FastAPI, Django or Express setups in{" "}
            the <a href="#stacks">integration guides</a>.
          </p>
        </Step>
      </div>
    </section>
  );
}
