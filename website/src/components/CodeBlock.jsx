import { useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-python";
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

/** A titled, syntax-highlighted, copyable code block. */
export default function CodeBlock({ language, filename, code }) {
  const grammar = Prism.languages[language];
  return (
    <figure className="codeblock">
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
