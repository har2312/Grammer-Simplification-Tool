"use client";

import { FinalGrammarCard } from "./FinalGrammarCard";
import type { SimplificationResult, SimplificationStep } from "../utils/grammarEngine";

interface DiffTimelineProps {
  result: SimplificationResult | null;
  activeStep: number;
  onStepChange: (step: number) => void;
}

type DiffStatus = "unchanged" | "added" | "removed";

interface DiffEntry {
  rule: string;
  status: DiffStatus;
}

const STEP_LABELS = ["Original", "1. Useless", "2. Null", "3. Unit", "Final"] as const;

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
        <div className="grammar-box diff-grammar-box">
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

export function DiffTimeline({ result, activeStep, onStepChange }: DiffTimelineProps) {
  const clampedStep = Math.max(0, Math.min(4, activeStep));
  const finalStartText = result ? `Final start symbol: ${result.finalStartSymbol}` : "Final start symbol: -";

  const renderPanelContent = () => {
    if (!result) {
      return (
        <article className="glass-card empty-card">
          <h3>No steps yet</h3>
          <p>Enter productions and click Simplify Grammar.</p>
        </article>
      );
    }

    if (clampedStep === 4) {
      return (
        <FinalGrammarCard
          finalStartSymbol={result.finalStartSymbol}
          finalGrammar={result.finalGrammar}
        />
      );
    }

    const currentStep = result.steps[clampedStep];
    const previousStep = clampedStep > 0 ? result.steps[clampedStep - 1] : undefined;

    return <StepDetails step={currentStep} previousStep={previousStep} />;
  };

  return (
    <section className="glass-card diff-timeline">
      <div className="slider-wrap">
        <div className="slider-topline">
          <h3>Step Slider</h3>
          <span>{finalStartText}</span>
        </div>

        <input
          className="timeline-slider"
          type="range"
          min={0}
          max={4}
          step={1}
          value={clampedStep}
          onChange={(event) => onStepChange(Number(event.target.value))}
        />

        <div className="slider-current-step">Active: {STEP_LABELS[clampedStep]}</div>

        <div className="slider-labels">
          {STEP_LABELS.map((label, index) => (
            <span
              key={label}
              className={`slider-label ${clampedStep === index ? "active" : ""}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="timeline-step-panel">{renderPanelContent()}</div>
    </section>
  );
}
