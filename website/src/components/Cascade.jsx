import { LEVELS } from "../levels.js";

/** The dataset's shape, drawn as itself: five nested levels with live counts. */
export default function Cascade({ counts }) {
  return (
    <section className="cascade" aria-label="Dataset counts by level">
      <ol>
        {LEVELS.map(({ key, rw, en }, i) => (
          <li key={key} className="cascade-row" style={{ "--depth": i }}>
            <span className="cascade-count">{counts[`${key}s`].toLocaleString("en-US")}</span>
            <span className="cascade-level">
              <strong>{rw}</strong> · {en}
              {counts[`${key}s`] === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
