import type { SimplificationStep } from "../utils/grammarEngine";

interface TimelineCardProps {
  step: SimplificationStep;
}

export function TimelineCard({ step }: TimelineCardProps) {
  return (
    <article className="glass-card timeline-card">
      <div className="step-heading">
        <span className="step-index">{step.id}</span>
        <div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      </div>

      <pre className="grammar-box">{step.grammarText}</pre>

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
