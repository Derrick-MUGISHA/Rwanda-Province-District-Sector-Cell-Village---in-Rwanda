import { useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-groovy";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-bash";

function useCopy(text) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context); selecting by hand still works.
    }
  };
  return [copied, copy];
}

export function CopyButton({ text }) {
  const [copied, copy] = useCopy(text);
  return (
    <button
      type="button"
      className={copied ? "copy-button copy-button--done" : "copy-button"}
      onClick={copy}
      aria-live="polite"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

/** A one-line shell command with a copy button. */
export function CopyCommand({ command }) {
  return (
    <span className="copy-command">
      <code>{command}</code>
      <CopyButton text={command} />
    </span>
  );
}

const PM_COMMANDS = {
  npm: "npm install rwanda-admin",
  yarn: "yarn add rwanda-admin",
  pnpm: "pnpm add rwanda-admin",
};

/** The JS install command with an npm/yarn/pnpm switcher — all three clients
 * install the same package from the npm registry. */
export function PmCommand() {
  const [pm, setPm] = useState(() => {
    try {
      const saved = localStorage.getItem("preferred-pm");
      return PM_COMMANDS[saved] ? saved : "npm";
    } catch {
      return "npm";
    }
  });
  const pick = (id) => {
    setPm(id);
    try {
      localStorage.setItem("preferred-pm", id);
    } catch {
      // Private browsing — the preference just won't persist.
    }
  };
  return (
    <span className="copy-command copy-command--pm">
      <span className="pm-switch" role="tablist" aria-label="Package manager">
        {Object.keys(PM_COMMANDS).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pm === id}
            className={pm === id ? "pm-tab pm-tab--on" : "pm-tab"}
            onClick={() => pick(id)}
          >
            {id}
          </button>
        ))}
      </span>
      <code>{PM_COMMANDS[pm]}</code>
      <CopyButton text={PM_COMMANDS[pm]} />
    </span>
  );
}

/** A titled, syntax-highlighted, copyable code block. */
export default function CodeBlock({ language, filename, code, compact = false }) {
  const grammar = Prism.languages[language];
  return (
    <figure className={compact ? "codeblock codeblock--compact" : "codeblock"}>
      <figcaption className="codeblock-header">
        {filename && <span className="codeblock-file">{filename}</span>}
        <span className="codeblock-lang">{language}</span>
        <CopyButton text={code} />
      </figcaption>
      <pre>
        {grammar ? (
          <code
            dangerouslySetInnerHTML={{ __html: Prism.highlight(code, grammar, language) }}
          />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </figure>
  );
}
