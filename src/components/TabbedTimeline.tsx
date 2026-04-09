"use client";

import { FinalGrammarCard } from "./FinalGrammarCard";
import { TimelineCard } from "./TimelineCard";
import type { SimplificationResult } from "../utils/grammarEngine";

export type TimelineTabKey = "original" | "useless" | "null" | "unit" | "final";

interface TabbedTimelineProps {
  result: SimplificationResult | null;
  activeTab: TimelineTabKey;
  onTabChange: (tab: TimelineTabKey) => void;
}

const TAB_DEFS: Array<{ key: TimelineTabKey; label: string }> = [
  { key: "original", label: "Original" },
  { key: "useless", label: "1. Useless" },
  { key: "null", label: "2. Null" },
  { key: "unit", label: "3. Unit" },
  { key: "final", label: "Final" },
];

export function TabbedTimeline({ result, activeTab, onTabChange }: TabbedTimelineProps) {
  const stepIndexByTab: Record<Exclude<TimelineTabKey, "final">, number> = {
    original: 0,
    useless: 1,
    null: 2,
    unit: 3,
  };

  const renderContent = () => {
    if (!result) {
      return (
        <article className="glass-card empty-card">
          <h3>No steps yet</h3>
          <p>Enter productions and click Simplify Grammar.</p>
        </article>
      );
    }

    if (activeTab === "final") {
      return (
        <FinalGrammarCard
          finalStartSymbol={result.finalStartSymbol}
          finalGrammar={result.finalGrammar}
        />
      );
    }

    const step = result.steps[stepIndexByTab[activeTab]];

    return <TimelineCard step={step} />;
  };

  return (
    <section className="glass-card tabbed-timeline">
      <nav className="tab-nav" aria-label="Simplification Steps Tabs">
        {TAB_DEFS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="tab-panel" role="tabpanel">
        {renderContent()}
      </div>
    </section>
  );
}
