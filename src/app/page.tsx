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
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const runSimplification = () => {
    try {
      const output = simplifyGrammar(grammarInput, startSymbol);
      setResult(output);
      setActiveStep(0);
      setErrorMessage("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      setResult(null);
      setActiveStep(0);
      setErrorMessage(message);
    }
  };

  const clearAll = () => {
    setGrammarInput("");
    setStartSymbol("S");
    setResult(null);
    setActiveStep(0);
    setErrorMessage("");
  };

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
              setActiveStep(0);
              setErrorMessage("");
            }}
            onClear={clearAll}
          />
          <QuickGuide />
        </aside>

        <section className="right-column">
          {result && result.warnings.length > 0 && (
            <div className="warning-box glass-card">
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

          <DiffTimeline result={result} activeStep={activeStep} onStepChange={setActiveStep} />
        </section>
      </section>
    </main>
  );
}
