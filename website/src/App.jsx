import { useEffect, useState } from "react";
import { getDataMeta } from "@derrick63/rwanda-admin-hierarchy";
import Hero from "./components/Hero.jsx";
import Cascade from "./components/Cascade.jsx";
import Demo from "./components/Demo.jsx";
import GetStarted from "./components/GetStarted.jsx";
import QuickStart from "./components/QuickStart.jsx";
import ApiReference from "./components/ApiReference.jsx";

const REPO_URL =
  "https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda";

const NAV = [
  { id: "demo", label: "Live demo" },
  { id: "get-started", label: "Get started" },
  { id: "stacks", label: "Stacks" },
  { id: "api", label: "API reference" },
];

/** Highlights the nav link of the section currently in view. */
function useActiveSection(ids) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export default function App() {
  const meta = getDataMeta();
  const active = useActiveSection(NAV.map((item) => item.id));

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="topbar-brand" href="#top">
            <span className="topbar-name">rwanda-admin-hierarchy</span>
            <span className="topbar-by">by Derrick MUGISHA</span>
          </a>
          <nav className="topbar-nav" aria-label="Sections">
            {NAV.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className={active === id ? "active" : undefined}>
                {label}
              </a>
            ))}
            <a href={REPO_URL} className="topbar-github">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <Hero />
        <Cascade counts={meta.counts} />
        <Demo />
        <GetStarted />
        <QuickStart />
        <ApiReference />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-author">
            Built and maintained by <a href="https://github.com/Derrick-MUGISHA">Derrick MUGISHA</a>.
          </p>
          <p>
            Data: {meta.source} ({meta.sourceDate}), published under {meta.license}. Code: ISC
            license. Codes follow {meta.codeStandard}. Dataset snapshot {meta.dataVersion}.
          </p>
          <p>
            <a href={REPO_URL}>GitHub</a> ·{" "}
            <a href="https://www.npmjs.com/package/@derrick63/rwanda-admin-hierarchy">npm</a> ·{" "}
            <a href="https://pypi.org/project/rwanda-admin-hierarchy/">PyPI</a>
          </p>
        </div>
      </footer>
    </>
  );
}
