"use client";

import { FinalGrammarCard } from "./FinalGrammarCard";
import type { SimplificationResult, SimplificationStep } from "../utils/grammarEngine";

interface DiffTimelineProps {
  result: SimplificationResult | null;
}

type DiffStatus = "unchanged" | "added" | "removed";

interface DiffEntry {
  rule: string;
  status: DiffStatus;
}

function parseRules(grammarText: string): string[] {
  return grammarText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function computeDiff(oldRules: string[], newRules: string[]): DiffEntry[] {
  const oldSet = new Set(oldRules);
  const newSet = new Set(newRules);
  const entries: DiffEntry[] = [];

  for (const rule of oldRules) {
    if (newSet.has(rule)) {
      entries.push({ rule, status: "unchanged" });
    } else {
      entries.push({ rule, status: "removed" });
    }
  }

  for (const rule of newRules) {
    if (!oldSet.has(rule)) {
      entries.push({ rule, status: "added" });
    }
  }

  return entries;
}

function StepDetails({ step, previousStep }: { step: SimplificationStep; previousStep?: SimplificationStep }) {
  const shouldShowDiff = step.id >= 1 && step.id <= 3 && previousStep !== undefined;
  let diffEntries: DiffEntry[] = [];

  if (shouldShowDiff && previousStep) {
    diffEntries = computeDiff(parseRules(previousStep.grammarText), parseRules(step.grammarText));
  }

  return (
    <article className="glass-card timeline-card step-details-card">
      <div className="step-heading">
        <span className="step-index">{step.id}</span>
        <div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      </div>

      {shouldShowDiff ? (
        <div className="grammar-box grammar-comparison">
          <div className="comparison-lhs diff-grammar-box">
            {diffEntries.map((entry, index) => (
              <div
                key={`${entry.status}-${entry.rule}-${index}`}
                className={`rule-line ${entry.status === "added" ? "added-rule" : ""} ${
                  entry.status === "removed" ? "removed-rule" : ""
                }`}
              >
                {entry.rule}
              </div>
            ))}
          </div>

          <div className="comparison-arrow" aria-hidden="true" />

          <pre className="comparison-rhs">{step.grammarText}</pre>
        </div>
      ) : (
        <pre className="grammar-box">{step.grammarText}</pre>
      )}

      <ul className="detail-list">
        {step.details.map((detail, index) => (
          <li key={`${step.id}-${detail}`} className={index === 0 ? "detail-strong" : ""}>
            {detail}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function DiffTimeline({ result }: DiffTimelineProps) {
  const finalStartText = result ? `Final start symbol: ${result.finalStartSymbol}` : "Final start symbol: -";

  return (
    <section className="glass-card diff-timeline">
      <div className="timeline-header">
        <h3>Study Feed</h3>
        <span>{finalStartText}</span>
      </div>

      <div className="timeline-step-panel">
        {!result ? (
          <article className="glass-card empty-card">
            <h3>No steps yet</h3>
            <p>Enter productions and click Simplify Grammar.</p>
          </article>
        ) : (
          <>
            {result.steps.map((step, index) => (
              <StepDetails
                key={step.id}
                step={step}
                previousStep={index > 0 ? result.steps[index - 1] : undefined}
              />
            ))}
            <FinalGrammarCard
              finalStartSymbol={result.finalStartSymbol}
              finalGrammar={result.finalGrammar}
            />
          </>
        )}
      </div>
    </section>
  );
}
