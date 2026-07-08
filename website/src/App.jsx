import { useEffect, useState } from "react";
import { getDataMeta } from "rwanda-admin";
import { Menu, X } from "lucide-react";
import Hero from "./components/Hero.jsx";
import Cascade from "./components/Cascade.jsx";
import Demo from "./components/Demo.jsx";
import GetStarted from "./components/GetStarted.jsx";
import Guides from "./components/Guides.jsx";
import ApiReference from "./components/ApiReference.jsx";
import Mark from "./components/Mark.jsx";
import RegistryStats from "./components/RegistryStats.jsx";
import { StackProvider } from "./stack-context.jsx";
import { cn } from "./lib/utils.js";

/** Fades sections up as they enter the viewport; no-ops under reduced motion. */
function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = document.querySelectorAll(".section-inner, .cascade");
    els.forEach((el) => el.classList.add("reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.06 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const REPO_URL =
  "https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda";

function GitHubIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

const NAV = [
  { id: "demo", label: "Live demo" },
  { id: "get-started", label: "Get started" },
  { id: "stacks", label: "Guides" },
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

function Navbar() {
  const active = useActiveSection(NAV.map((item) => item.id));
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hillline bg-tea/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-272 items-center justify-between gap-4 px-6 py-3">
        <a href="#top" className="flex items-center gap-3 no-underline leading-tight">
          <Mark className="h-9 w-9" />
          <span className="flex flex-col">
            <span className="font-mono font-semibold text-mist">rwanda-admin</span>
            {/* <span className="text-[0.72rem] tracking-wide text-mistdim">by Derrick MUGISHA</span> */}
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Sections">
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                "border-b-2 border-transparent py-1 no-underline transition-colors hover:border-sun",
                active === id && "border-sun text-sun"
              )}
            >
              {label}
            </a>
          ))}
          <a
            href={REPO_URL}
            className="inline-flex items-center gap-2 rounded-full border border-hillline px-4 py-1.5 no-underline transition-colors hover:border-sun"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        </nav>

        <button
          type="button"
          className="text-mist md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          className="flex flex-col border-t border-hillline px-6 py-3 md:hidden"
          aria-label="Sections"
        >
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className={cn(
                "py-2.5 text-base no-underline border-b border-hillline/40 last:border-0",
                active === id && "text-sun"
              )}
            >
              {label}
            </a>
          ))}
          <a href={REPO_URL} className="flex items-center gap-2 py-2.5 no-underline">
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        </nav>
      )}
    </header>
  );
}

function Footer({ meta }) {
  return (
    <footer className="border-t border-hillline">
      <div className="mx-auto grid max-w-272 gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Mark className="h-10 w-10" />
            <div className="leading-tight">
              <p className="m-0 font-mono font-semibold">rwanda-admin</p>
              <p className="m-0 text-sm text-mistdim">
                {/* by <a href="https://github.com/Derrick-MUGISHA">Derrick MUGISHA</a> */}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-104 text-sm text-mistdim">
            One dataset of Rwanda's five administrative levels, kept in lockstep across four
            package registries. Free to use the data under <strong>CC-BY-4.0</strong>, the code under <strong>ISC</strong>.
          </p>
        </div>
        <nav aria-label="Packages">
          <h4 className="text-mist">Packages</h4>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-mistdim">
            <li><a href="https://www.npmjs.com/package/rwanda-admin"><strong>npm JavaScript</strong></a></li>
            <li><a href="https://pypi.org/project/rwanda-admin/"><strong>PyPI Python</strong></a></li>
            <li><a href={`${REPO_URL}/packages`}><strong>GitHub Packages Java</strong></a></li>
            <li><a href={`${REPO_URL}/tree/main/dart`}><strong>pub via git Dart / Flutter</strong></a></li>
          </ul>
        </nav>
        <nav aria-label="Explore">
          <h4 className="text-mist">Explore</h4>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-mistdim">
            <li><a href="#demo">Live demo</a></li>
            <li><a href="#get-started">Get started</a></li>
            <li><a href="#stacks">Integration guides</a></li>
            <li><a href="#api">API reference</a></li>
            <li><a href={REPO_URL}>Source on GitHub</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-hillline/60">
        <p className="mx-auto px-6 py-5 text-[.8125rem] text-mistdim">
          <strong>Data:</strong>  {meta.source} ({meta.sourceDate}) · {meta.license} · codes follow{" "}
          {meta.codeStandard} · dataset snapshot {meta.dataVersion}
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const meta = getDataMeta();
  useScrollReveal();

  return (
    <StackProvider>
      <Navbar />

      <main id="top">
        <div className="hills-bg">
          <Hero />
          <Cascade counts={meta.counts} />
          <RegistryStats />
        </div>
        <Demo />
        <GetStarted />
        <Guides />
        <ApiReference />
      </main>

      <Footer meta={meta} />
    </StackProvider>
  );
}
