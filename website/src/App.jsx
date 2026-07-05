import { getDataMeta } from "@derrick63/rwanda-admin-hierarchy";
import Hero from "./components/Hero.jsx";
import Cascade from "./components/Cascade.jsx";
import Demo from "./components/Demo.jsx";
import QuickStart from "./components/QuickStart.jsx";
import ApiReference from "./components/ApiReference.jsx";

const REPO_URL =
  "https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda";

export default function App() {
  const meta = getDataMeta();

  return (
    <>
      <header className="topbar">
        <span className="topbar-name">
          rwanda-admin-hierarchy <span className="topbar-version">{meta.dataVersion} data</span>
        </span>
        <nav className="topbar-nav" aria-label="Sections">
          <a href="#demo">Demo</a>
          <a href="#quick-start">Quick start</a>
          <a href="#api">API</a>
          <a href={REPO_URL}>GitHub</a>
        </nav>
      </header>

      <main>
        <Hero />
        <Cascade counts={meta.counts} />
        <Demo />
        <QuickStart />
        <ApiReference />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p>
            Data: {meta.source} ({meta.sourceDate}), published under {meta.license}. Code: ISC
            license. Codes follow {meta.codeStandard}.
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
