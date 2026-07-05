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
import CodeBlock, { CopyCommand } from "./CodeBlock.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs.jsx";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
import { INSTALL_COMMANDS, STACKS, useStack } from "../stack-context.jsx";
import { LEVELS, pathNames } from "../levels.js";

const NEP_LABELS = {
  GE: "grid extension",
  SAS: "standalone solar",
  Microgrid: "microgrid",
};

/* Per-language equivalents of the calls the picker just made. Every line is
   real API: JS ships the full surface; the other packages ship traversal. */
const READOUTS = {
  js: {
    language: "javascript",
    filename: "picker-calls.js",
    setup: [],
    call: (fn, id, count, noun) => `${fn.js}("${id}"); // ${count} ${noun}`,
    provinces: (n) => `getProvinces(); // ${n} provinces`,
    path: (id) => `getPath("${id}"); // full chain, shown above`,
  },
  python: {
    language: "python",
    filename: "picker_calls.py",
    setup: ["from rwanda_admin_hierarchy import *", ""],
    call: (fn, id, count, noun) => `${fn.py}("${id}")  # ${count} ${noun}`,
    provinces: (n) => `get_provinces()  # ${n} provinces`,
    path: () => "# path lookup and search ship in the JS package today",
  },
  java: {
    language: "java",
    filename: "PickerCalls.java",
    setup: ["var rwanda = RwandaHierarchyService.loadDefault();", ""],
    call: (fn, id, count, noun) => `rwanda.${fn.java}("${id}"); // Optional — ${count} ${noun}`,
    provinces: (n) => `rwanda.getProvinces(); // ${n} provinces`,
    path: () => "// path lookup and search ship in the JS package today",
  },
  dart: {
    language: "dart",
    filename: "picker_calls.dart",
    setup: ["final rwanda = await RwandaAdminHierarchy.load();", ""],
    call: (fn, id, count, noun) => `rwanda.${fn.dart}("${id}"); // ${count} ${noun}`,
    provinces: (n) => `rwanda.provinces; // ${n} provinces`,
    path: () => "// path lookup and search ship in the JS package today",
  },
};

const CHILD_FNS = {
  district: {
    js: "getDistrictsByProvinceId",
    py: "get_districts_by_province_id",
    java: "getDistrictsByProvinceId",
    dart: "districtsByProvinceId",
  },
  sector: {
    js: "getSectorsByDistrictId",
    py: "get_sectors_by_district_id",
    java: "getSectorsByDistrictId",
    dart: "sectorsByDistrictId",
  },
  cell: {
    js: "getCellsBySectorId",
    py: "get_cells_by_sector_id",
    java: "getCellsBySectorId",
    dart: "cellsBySectorId",
  },
  village: {
    js: "getVillagesByCellId",
    py: "get_villages_by_cell_id",
    java: "getVillagesByCellId",
    dart: "villagesByCellId",
  },
};

const SEARCH_EXAMPLES = ["gitega", "KIGALÍ", "nyarugengye"];

function pickerCode(stack, selected, options) {
  const readout = READOUTS[stack];
  const lines = [...readout.setup, readout.provinces(options.province.length)];
  for (let i = 1; i < LEVELS.length; i++) {
    const { key, en } = LEVELS[i];
    const parentId = selected[LEVELS[i - 1].key];
    if (!parentId) break;
    const count = options[key] ? options[key].length : 0;
    lines.push(readout.call(CHILD_FNS[key], parentId, count, `${en.toLowerCase()}s`));
  }
  if (selected.village) {
    lines.push(readout.path(selected.village));
  }
  return lines.join("\n");
}

function LevelSelect({ level, rw, en, value, options, onChange }) {
  return (
    <label className="mb-3.5 block">
      <span className="mb-1 block text-[0.85rem] text-forest">
        <strong className="font-display text-inkbody">{rw}</strong> · {en}
      </span>
      <Select value={value || ""} disabled={!options} onValueChange={(id) => onChange(level, id)}>
        <SelectTrigger aria-label={`${en} (${rw})`}>
          <SelectValue placeholder={options ? "Select…" : "Choose the level above first"} />
        </SelectTrigger>
        <SelectContent>
          {(options || []).map((node) => (
            <SelectItem key={node.id} value={node.id}>
              {node.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function Picker({ stack }) {
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
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Pick a place, top down</CardTitle>
          <CardDescription>Five levels, each one call away.</CardDescription>
        </div>
        {selected.province && (
          <Button variant="outline-light" size="sm" onClick={() => setSelected({})}>
            Reset
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {LEVELS.map(({ key, rw, en }) => (
          <LevelSelect
            key={key}
            level={key}
            rw={rw}
            en={en}
            value={selected[key]}
            options={options[key]}
            onChange={choose}
          />
        ))}

        {village && (
          <div className="mt-4 rounded-r-md border-l-4 border-sun bg-mist/70 px-4 py-3" role="status">
            <p className="m-0 mb-1 font-display font-bold">{pathNames(village).join(" › ")}</p>
            <p className="m-0 text-sm text-forest">
              NISR code <code>{village.village.code ?? "—"}</code>
              {villageNode?.nep && (
                <> · electrification: {NEP_LABELS[villageNode.nep] ?? villageNode.nep}</>
              )}
            </p>
          </div>
        )}

        <div className="mt-5">
          <p className="m-0 mb-1.5 text-[0.75rem] font-bold uppercase tracking-wider text-forest">
            The code this widget is running
          </p>
          <CodeBlock
            language={READOUTS[stack].language}
            filename={READOUTS[stack].filename}
            code={pickerCode(stack, selected, options)}
            compact
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SearchCard() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query.trim() ? search(query, { limit: 8 }) : []), [query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Or search any level</CardTitle>
        <CardDescription>
          <strong className="font-display text-inkbody">Shakisha</strong> — case-, accent- and
          typo-tolerant across all 17,409 places.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          type="search"
          value={query}
          placeholder="Type a province, sector or village name…"
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full rounded-md border border-leafline bg-white px-3 text-sm text-inkbody shadow-sm placeholder:text-forest/60 hover:border-sundeep focus:outline-none focus-visible:ring-2 focus-visible:ring-sun"
        />
        <p className=" p-4 mt-2.5 mb-5 flex flex-wrap items-center gap-1.5 text-[0.85rem] text-forest">
          Try:
          {SEARCH_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuery(example)}
              className="cursor-pointer rounded-full border border-leafline bg-white px-2.5 py-0.5 font-mono text-[0.8rem] text-inkbody hover:border-sundeep"
            >
              {example}
            </button>
          ))}
        </p>

        {query.trim() && (
          <ol className="m-0 mt-3 list-none p-0">
            {results.length === 0 && (
              <li className="py-2 text-sm text-forest">No match — try fewer letters.</li>
            )}
            {results.map((result) => (
              <li
                key={result.id}
                className="grid grid-cols-[auto_auto_1fr] items-baseline gap-2.5 border-t border-leafline px-1 py-2"
              >
                <span className="text-sm font-semibold">{result.name}</span>
                <Badge variant="level">{result.level}</Badge>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.85rem] text-forest">
                  {pathNames(result.path).join(" › ")}
                </span>
              </li>
            ))}
          </ol>
        )}

        {query.trim() && (
          <div className="mt-5">
            <p className="m-0 mb-1.5 text-[0.75rem] font-bold uppercase tracking-wider text-forest">
              The code this widget is running
            </p>
            <CodeBlock
              language="javascript"
              filename="search-call.js"
              code={`search(${JSON.stringify(query)}, { limit: 8 }); // ${results.length} result${
                results.length === 1 ? "" : "s"
              }`}
              compact
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Demo() {
  const [stack, setStack] = useStack();

  return (
    <section id="demo" className="section section--light">
      <div className="section-inner">
        <p className="eyebrow">Live demo</p>
        <h2>This page has all 14,816 villages in it</h2>
        <p className="section-lead">
          Both widgets run entirely in your browser on the npm package — and the picker shows you
          its own source in the language you work in.
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Tabs value={stack} onValueChange={setStack}>
            <TabsList aria-label="Show the code in your language">
              {STACKS.map(({ id, label }) => (
                <TabsTrigger key={id} value={id}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <CopyCommand command={INSTALL_COMMANDS[stack]} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Picker stack={stack} />
          <SearchCard />
        </div>
      </div>
    </section>
  );
}
