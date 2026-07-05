import { BookOpen, Lightbulb, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/utils.js";

const KINDS = {
  learn: { icon: BookOpen, title: "You will learn", tone: "border-sundeep/40 bg-sun/10" },
  note: { icon: Lightbulb, title: "Note", tone: "border-leafline bg-white" },
  pitfall: { icon: TriangleAlert, title: "Pitfall", tone: "border-amber-600/40 bg-amber-50" },
};

/** react.dev-style callout box for guides. */
export function Callout({ kind = "note", title, className, children }) {
  const { icon: Icon, title: defaultTitle, tone } = KINDS[kind] ?? KINDS.note;
  return (
    <aside className={cn("my-4 rounded-lg border px-4 py-3 text-[0.95rem]", tone, className)}>
      <p className="m-0 mb-1 flex items-center gap-2 font-display font-bold text-inkbody">
        <Icon className="h-4 w-4 text-sundeep" aria-hidden="true" />
        {title ?? defaultTitle}
      </p>
      <div className="[&>p]:m-0 [&>p+p]:mt-1 [&>ul]:m-0 [&>ul]:pl-5 text-inkbody/90">{children}</div>
    </aside>
  );
}
