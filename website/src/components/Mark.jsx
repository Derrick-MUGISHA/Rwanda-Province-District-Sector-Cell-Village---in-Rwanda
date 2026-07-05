/** The brand mark: the code-anatomy staircase — five levels, one code. */
export default function Mark({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" className="fill-hill" />
      <g className="fill-sun">
        <rect x="12" y="13" width="9" height="5.5" rx="2.75" />
        <rect x="12" y="21.5" width="17" height="5.5" rx="2.75" />
        <rect x="12" y="30" width="25" height="5.5" rx="2.75" />
        <rect x="12" y="38.5" width="33" height="5.5" rx="2.75" />
        <rect x="12" y="47" width="41" height="5.5" rx="2.75" />
      </g>
    </svg>
  );
}
