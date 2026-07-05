import { useMemo, useState } from "react";
import {
  getProvinces,
  getDistrictsByProvinceId,
  getSectorsByDistrictId,
  getCellsBySectorId,
  getVillagesByCellId,
  getPath,
  search,
} from "@derrick63/rwanda-admin-hierarchy";
import CodeBlock from "./CodeBlock.jsx";
import { LEVELS, pathNames } from "../levels.js";

const NEP_LABELS = {
  GE: "grid extension",
  SAS: "standalone solar",
  Microgrid: "microgrid",
};

const CHILD_CALLS = {
  district: "getDistrictsByProvinceId",
  sector: "getSectorsByDistrictId",
  cell: "getCellsBySectorId",
  village: "getVillagesByCellId",
};

const SEARCH_EXAMPLES = ["gitega", "KIGALÍ", "nyarugengye"];

/** The code the picker just ran, rebuilt from its current state. */
function pickerCode(selected, options) {
  const lines = [`getProvinces(); // ${options.province.length} provinces`];
  for (let i = 1; i < LEVELS.length; i++) {
    const { key, en } = LEVELS[i];
    const parentId = selected[LEVELS[i - 1].key];
    if (!parentId) break;
    const count = options[key] ? options[key].length : 0;
    lines.push(`${CHILD_CALLS[key]}("${parentId}"); // ${count} ${en.toLowerCase()}s`);
  }
  if (selected.village) {
    lines.push(`getPath("${selected.village}"); // full chain, shown above`);
  }
  return lines.join("\n");
}

function Picker() {
  const [selected, setSelected] = useState({});

  const options = {
    province: getProvinces(),
    district: selected.province ? getDistrictsByProvinceId(selected.province) : null,
    sector: selected.district ? getSectorsByDistrictId(selected.district) : null,
    cell: selected.sector ? getCellsBySectorId(selected.sector) : null,
    village: selected.cell ? getVillagesByCellId(selected.cell) : null,
  };

  const choose = (level, id) => {
    const next = {};
    for (const { key } of LEVELS) {
      next[key] = selected[key];
      if (key === level) break;
    }
    next[level] = id || undefined;
    setSelected(next);
  };

  const village = selected.village ? getPath(selected.village) : null;
  // getPath returns summarized nodes; nep only exists on the raw village.
  const villageNode = selected.village
    ? (options.village || []).find((v) => v.id === selected.village)
    : null;

  return (
    <div className="picker">
      <div className="demo-widget-head">
        <h3>Pick a place, top down</h3>
        {selected.province && (
          <button type="button" className="demo-reset" onClick={() => setSelected({})}>
            Reset
          </button>
        )}
      </div>
      {LEVELS.map(({ key, rw, en }) => (
        <label key={key} className="picker-field">
          <span className="picker-label">
            <strong>{rw}</strong> · {en}
          </span>
          <select
            value={selected[key] || ""}
            disabled={!options[key]}
            onChange={(e) => choose(key, e.target.value)}
          >
            <option value="">{options[key] ? "Select…" : "—"}</option>
            {(options[key] || []).map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </label>
      ))}

      {village && (
        <div className="picker-result" role="status">
          <p className="picker-chain">{pathNames(village).join(" › ")}</p>
          <p className="picker-meta">
            NISR code <code>{village.village.code ?? "—"}</code>
            {villageNode?.nep && (
              <> · electrification: {NEP_LABELS[villageNode.nep] ?? villageNode.nep}</>
            )}
          </p>
        </div>
      )}

      <div className="demo-code">
        <p className="demo-code-label">The code this widget is running:</p>
        <CodeBlock
          language="javascript"
          filename="picker-calls.js"
          code={pickerCode(selected, options)}
        />
      </div>
    </div>
  );
}

function Search() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query.trim() ? search(query, { limit: 8 }) : []), [query]);

  return (
    <div className="search">
      <div className="demo-widget-head">
        <h3>Or search any level</h3>
      </div>
      <label className="picker-field">
        <span className="picker-label">
          <strong>Shakisha</strong> · case-, accent- and typo-tolerant
        </span>
        <input
          type="search"
          value={query}
          placeholder="Type a province, sector or village name…"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <p className="search-examples">
        Try:{" "}
        {SEARCH_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="search-chip"
            onClick={() => setQuery(example)}
          >
            {example}
          </button>
        ))}
      </p>
      {query.trim() && (
        <ol className="search-results">
          {results.length === 0 && <li className="search-empty">No match — try fewer letters.</li>}
          {results.map((result) => (
            <li key={result.id}>
              <span className="search-name">{result.name}</span>
              <span className="search-level">{result.level}</span>
              <span className="search-path">{pathNames(result.path).join(" › ")}</span>
            </li>
          ))}
        </ol>
      )}
      {query.trim() && (
        <div className="demo-code">
          <p className="demo-code-label">The code this widget is running:</p>
          <CodeBlock
            language="javascript"
            filename="search-call.js"
            code={`search(${JSON.stringify(query)}, { limit: 8 }); // ${results.length} result${
              results.length === 1 ? "" : "s"
            }`}
          />
        </div>
      )}
    </div>
  );
}

export default function Demo() {
  return (
    <section id="demo" className="section section--light">
      <div className="section-inner">
        <p className="eyebrow">Live demo</p>
        <h2>This page has all 14,816 villages in it</h2>
        <p className="section-lead">
          Both widgets run entirely in your browser on the npm package — the same calls you would
          ship in a React address form. Watch the code they execute update as you use them.
        </p>
        <div className="demo-grid">
          <Picker />
          <Search />
        </div>
      </div>
    </section>
  );
}
