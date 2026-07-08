import { useEffect, useState } from "react";

const REPO = "Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda";
const REPO_API = `https://api.github.com/repos/${REPO}`;

/** Total item count from a paginated GitHub endpoint via the Link header. */
async function countViaLinkHeader(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const match = /[?&]page=(\d+)>; rel="last"/.exec(res.headers.get("Link") ?? "");
  if (match) return Number(match[1]);
  const body = await res.json();
  return Array.isArray(body) ? body.length : null;
}

function useRegistryStats() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    let alive = true;
    const merge = (patch) => alive && setStats((prev) => ({ ...prev, ...patch }));

    fetch(REPO_API)
      .then((r) => (r.ok ? r.json() : null))
      .then((repo) => repo && merge({ stars: repo.stargazers_count, forks: repo.forks_count }))
      .catch(() => {});
    countViaLinkHeader(`${REPO_API}/commits?per_page=1`)
      .then((n) => n != null && merge({ commits: n }))
      .catch(() => {});
    countViaLinkHeader(`${REPO_API}/contributors?per_page=1&anon=1`)
      .then((n) => n != null && merge({ contributors: n }))
      .catch(() => {});
    fetch("https://api.npmjs.org/downloads/point/last-month/rwanda-admin")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && merge({ npm: d.downloads }))
      .catch(() => {});
    fetch("https://pypistats.org/api/packages/rwanda-admin/recent")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.data && merge({ pypi: d.data.last_month }))
      .catch(() => {});
    fetch(`${REPO_API}/releases/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((rel) => rel?.tag_name && merge({ version: rel.tag_name }))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return stats;
}

const fmt = (n) =>
  n == null ? "—" : n >= 10000 ? Intl.NumberFormat("en", { notation: "compact" }).format(n) : n.toLocaleString("en-US");

function Tile({ href, label, value, sub }) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-hillline bg-hill/70 px-5 py-4 no-underline transition-colors hover:border-sun"
    >
      <p className="m-0 text-[0.72rem] font-bold uppercase tracking-wider text-mistdim">{label}</p>
      <p className="m-0 mt-1 font-mono text-2xl font-semibold text-sun">{value}</p>
      <p className="m-0 mt-0.5 text-[0.82rem] text-mistdim">{sub}</p>
    </a>
  );
}

/** Live numbers from GitHub, npm and PyPI, fetched in the visitor's browser.
 * Maven has no public download API on GitHub Packages, so it shows the
 * published version instead. */
export default function RegistryStats() {
  const stats = useRegistryStats();

  const githubSub = [
    stats.commits != null && `${fmt(stats.commits)} commits`,
    stats.contributors != null && `${fmt(stats.contributors)} contributor${stats.contributors === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="mx-auto max-w-272 px-6 pb-16" aria-label="Live registry statistics">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-5">
        <Tile
          href={`https://github.com/${REPO}`}
          label="GitHub"
          value={stats.stars == null ? "—" : `★ ${fmt(stats.stars)}`}
          sub={githubSub || "stars · commits · contributors"}
        />
        <Tile
          href="https://www.npmjs.com/package/rwanda-admin"
          label="npm · JavaScript"
          value={fmt(stats.npm)}
          sub="downloads, last month"
        />
        <Tile
          href="https://pypi.org/project/rwanda-admin/"
          label="PyPI · Python"
          value={fmt(stats.pypi)}
          sub="downloads, last month"
        />
        <Tile
          href={`https://github.com/${REPO}/packages`}
          label="Maven · Java"
          value={stats.version ?? "v1.2.0"}
          sub="on GitHub Packages"
        />
      </div>
      <p className="m-0 mt-4 text-[0.78rem] text-mistdim">
        Fetched live from GitHub, npm and PyPI as you loaded this page.
      </p>
    </section>
  );
}
