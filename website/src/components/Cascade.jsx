import { useEffect, useRef, useState } from "react";
import { LEVELS } from "../levels.js";

/** Counts up from 0 when scrolled into view; instant under reduced motion. */
function CountUp({ value }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 800;
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display.toLocaleString("en-US")}</span>;
}

/** The dataset's shape, drawn as itself: five nested levels with live counts. */
export default function Cascade({ counts }) {
  return (
    <section className="cascade" aria-label="Dataset counts by level">
      <ol>
        {LEVELS.map(({ key, rw, en }, i) => (
          <li key={key} className="cascade-row" style={{ "--depth": i }}>
            <span className="cascade-count">
              <CountUp value={counts[`${key}s`]} />
            </span>
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
