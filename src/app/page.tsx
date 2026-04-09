"use client";

import { useMemo, useState } from "react";
import { InputSection } from "../components/InputSection";
import { QuickGuide } from "../components/QuickGuide";
import { TabbedTimeline, type TimelineTabKey } from "../components/TabbedTimeline";
import { simplifyGrammar, type SimplificationResult } from "../utils/grammarEngine";

const EXAMPLE_GRAMMAR = `S -> A B | b
A -> a | ε
B -> C | b
C -> ε | c
D -> d`;

function buildInitialResult(): SimplificationResult | null {
  try {
    return simplifyGrammar(EXAMPLE_GRAMMAR, "S");
  } catch {
    return null;
  }
}

export default function HomePage() {
  const [grammarInput, setGrammarInput] = useState(EXAMPLE_GRAMMAR);
  const [startSymbol, setStartSymbol] = useState("S");
  const [result, setResult] = useState<SimplificationResult | null>(buildInitialResult);
  const [activeTab, setActiveTab] = useState<TimelineTabKey>("original");
  const [errorMessage, setErrorMessage] = useState("");

  const runSimplification = () => {
    try {
      const output = simplifyGrammar(grammarInput, startSymbol);
      setResult(output);
      setActiveTab("original");
      setErrorMessage("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      setResult(null);
      setActiveTab("original");
      setErrorMessage(message);
    }
  };

  const clearAll = () => {
    setGrammarInput("");
    setStartSymbol("S");
    setResult(null);
    setActiveTab("original");
    setErrorMessage("");
  };

  const guideItems = useMemo(
    () => [
      "Write one production per line.",
      "Use S -> A B | a style notation.",
      "Use ε for null production (or epsilon / lambda).",
      "Click Simplify Grammar to see each transformation.",
    ],
    []
  );

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Compiler Design Lab</p>
        <h1>Grammar Simplification Tool</h1>
        <p>
          Deep-visual CFG simplification with mathematically ordered transformations:
          useless symbols, null productions, and unit productions.
        </p>
      </header>

      <section className="workspace-grid">
        <aside className="left-column">
          <InputSection
            startSymbol={startSymbol}
            grammarInput={grammarInput}
            errorMessage={errorMessage}
            onStartSymbolChange={setStartSymbol}
            onGrammarChange={setGrammarInput}
            onSimplify={runSimplification}
            onLoadExample={() => {
              setGrammarInput(EXAMPLE_GRAMMAR);
              setStartSymbol("S");
              setResult(buildInitialResult());
              setActiveTab("original");
              setErrorMessage("");
            }}
            onClear={clearAll}
          />
          <QuickGuide items={guideItems} exampleGrammar={EXAMPLE_GRAMMAR} />
        </aside>

        <section className="right-column">
          <div className="timeline-header glass-card">
            <h2>Simplification Timeline</h2>
            <span>{result ? `Final start symbol: ${result.finalStartSymbol}` : "Run to generate steps"}</span>
          </div>

          {result && result.warnings.length > 0 && (
            <div className="warning-box glass-card">
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

          <TabbedTimeline result={result} activeTab={activeTab} onTabChange={setActiveTab} />
        </section>
      </section>
    </main>
  );
}
