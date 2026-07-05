import { getPath } from "@derrick63/rwanda-admin-hierarchy";
import { LEVELS } from "../levels.js";

const EXAMPLE_VILLAGE = "village-11010103";
const CODE = "11010103";

/**
 * The signature element: a real NISR village code, decoded live by the
 * package. Each digit-prefix of the code is an ancestor: 1 is the province,
 * 11 the district, 1101 the sector, 110101 the cell, 11010103 the village.
 */
export default function Hero() {
  const path = getPath(EXAMPLE_VILLAGE);

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

      <figure className="anatomy" aria-label="How an 8-digit NISR village code encodes its full ancestry">
        <div className="anatomy-code" aria-hidden="true">
          {CODE.split("").map((digit, i) => (
            <span key={i}>{digit}</span>
          ))}
        </div>
        <ol className="anatomy-rows">
          {LEVELS.map(({ key, rw, en, digits }, i) => (
            <li key={key} className="anatomy-row" style={{ "--i": i }}>
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
          itself.
        </figcaption>
      </figure>

      <div className="hero-install">
        <code>npm install @derrick63/rwanda-admin-hierarchy</code>
        <a className="button" href="#quick-start">
          Quick start
        </a>
      </div>
    </section>
  );
}
