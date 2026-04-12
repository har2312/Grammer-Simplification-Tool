const GUIDE_ITEMS = [
  "One rule per line (e.g., S -> A B | b).",
  "Type 'null' to insert the epsilon symbol (ε).",
  "Type a Capital + Space to insert an arrow (->).",
];

export function QuickGuide() {
  return (
    <div className="glass-card quick-guide-card">
      <h3>Quick Guide</h3>
      <ul className="guide-list compact-guide-list">
        {GUIDE_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
