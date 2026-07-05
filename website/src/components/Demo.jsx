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
import { LEVELS, pathNames } from "../levels.js";

const NEP_LABELS = {
  GE: "grid extension",
  SAS: "standalone solar",
  Microgrid: "microgrid",
};

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
    </div>
  );
}

function Search() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query.trim() ? search(query, { limit: 8 }) : []), [query]);

  return (
    <div className="search">
      <label className="picker-field">
        <span className="picker-label">
          <strong>Shakisha</strong> · Search any level
        </span>
        <input
          type="search"
          value={query}
          placeholder="Try “gitega”, “Kigali”, or a misspelling like “nyarugengye”"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
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
          Both widgets below run entirely in your browser on the npm package — the same calls you
          would ship in a React address form. Search is case-, diacritic- and typo-tolerant.
        </p>
        <div className="demo-grid">
          <Picker />
          <Search />
        </div>
      </div>
    </section>
  );
}
