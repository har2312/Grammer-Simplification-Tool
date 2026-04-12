"use client";

import { useState } from "react";
import { DiffTimeline } from "@/components/DiffTimeline";
import { InputSection } from "../components/InputSection";
import { QuickGuide } from "../components/QuickGuide";
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
  const [errorMessage, setErrorMessage] = useState("");

  const runSimplification = () => {
    try {
      const output = simplifyGrammar(grammarInput, startSymbol);
      setResult(output);
      setErrorMessage("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      setResult(null);
      setErrorMessage(message);
    }
  };

  const clearAll = () => {
    setGrammarInput("");
    setStartSymbol("S");
    setResult(null);
    setErrorMessage("");
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <h1>Grammar Simplification Tool</h1>
        <p>
          Deep-visual CFG simplification with mathematically ordered transformations:
          null productions, unit productions, and useless symbols.
        </p>
      </header>

      <section className="workspace-grid">
        <aside className="left-column">
          <QuickGuide />
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
              setErrorMessage("");
            }}
            onClear={clearAll}
          />
        </aside>

        <section className="right-column">
          {result && result.warnings.length > 0 && (
            <div className="warning-box glass-card">
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

          <DiffTimeline result={result} />
        </section>
      </section>
    </main>
  );
}
