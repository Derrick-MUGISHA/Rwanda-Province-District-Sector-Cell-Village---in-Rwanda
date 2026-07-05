import { createContext, useContext, useEffect, useState } from "react";

/** The four ecosystems the package ships for. One selection drives the whole
 * page: the demo's code readout, its install command, and the open guide. */
export const STACKS = [
  { id: "js", label: "JavaScript / React" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "dart", label: "Dart / Flutter" },
];

export const INSTALL_COMMANDS = {
  js: "npm install @derrick63/rwanda-admin-hierarchy",
  python: 'pip install "rwanda-admin-hierarchy[fastapi]"',
  java: "io.github.derickmugisha:rwanda-admin-hierarchy:1.3.0",
  dart: "flutter pub add rwanda_admin_hierarchy --git-url=https://github.com/Derrick-MUGISHA/Rwanda-Province-District-Sector-Cell-Village---in-Rwanda.git --git-path=dart",
};

const StackContext = createContext(["js", () => {}]);

export function StackProvider({ children }) {
  const [stack, setStack] = useState(() => {
    try {
      const saved = localStorage.getItem("preferred-stack");
      return STACKS.some((s) => s.id === saved) ? saved : "js";
    } catch {
      return "js";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("preferred-stack", stack);
    } catch {
      // Private browsing — the preference just won't persist.
    }
  }, [stack]);

  return <StackContext.Provider value={[stack, setStack]}>{children}</StackContext.Provider>;
}

export const useStack = () => useContext(StackContext);
