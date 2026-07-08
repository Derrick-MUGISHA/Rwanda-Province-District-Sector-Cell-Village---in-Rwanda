import { useState } from "react";
import { getPath } from "rwanda-admin";
import { PmCommand } from "./CodeBlock.jsx";
import { LEVELS } from "../levels.js";

const EXAMPLE_VILLAGE = "village-11010103";
const CODE = "11010103";

/**
 * The signature element: a real NISR village code, decoded live by the
 * package. Each digit-prefix of the code is an ancestor: 1 is the province,
 * 11 the district, 1101 the sector, 110101 the cell, 11010103 the village.
 * Hovering a level lights up exactly the digits that encode it.
 */
export default function Hero() {
  const path = getPath(EXAMPLE_VILLAGE);
  const [hot, setHot] = useState(null); // number of highlighted digits, or null

  return (
    <section className="hero">
      <p className="eyebrow">Open data · NISR · CC-BY-4.0</p>
      <h1>
        Every place in Rwanda,
        <br />
        decoded from one number.
      </h1>
      <p className="hero-lead">
        The complete administrative hierarchy of Rwanda — province, district, sector, cell,
        village — with official NISR codes, packaged for JavaScript, Python, Java and Flutter.
        No API keys, no network calls: the dataset ships inside the package.
      </p>

      <figure
        className="anatomy"
        aria-label="How an 8-digit NISR village code encodes its full ancestry"
      >
        <div className="anatomy-code" aria-hidden="true">
          {CODE.split("").map((digit, i) => (
            <span key={i} className={hot !== null && i >= hot ? "digit-dim" : undefined}>
              {digit}
            </span>
          ))}
        </div>
        <ol className="anatomy-rows">
          {LEVELS.map(({ key, rw, en, digits }, i) => (
            <li
              key={key}
              className={hot === digits ? "anatomy-row anatomy-row--hot" : "anatomy-row"}
              style={{ "--i": i }}
              onMouseEnter={() => setHot(digits)}
              onMouseLeave={() => setHot(null)}
            >
              <span className="anatomy-track">
                <span
                  className="anatomy-bar"
                  style={{ width: `calc(${digits} * var(--digit-w))` }}
                >
                  {CODE.slice(0, digits)}
                </span>
              </span>
              <span className="anatomy-label">
                <strong>{rw}</strong> · {en}
              </span>
              <span className="anatomy-name">{path[key].name}</span>
            </li>
          ))}
        </ol>
        <figcaption className="anatomy-caption">
          <code>getPath("{EXAMPLE_VILLAGE}")</code> — resolved in your browser by the package
          itself. Hover a level to see which digits encode it.
        </figcaption>
      </figure>

      <div className="hero-install">
        <PmCommand />
        <a className="button" href="#get-started">
          Get started
        </a>
        <span className="hero-registries">also on PyPI · Maven</span>
      </div>
    </section>
  );
}
