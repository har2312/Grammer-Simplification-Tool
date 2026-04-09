interface QuickGuideProps {
  items: string[];
  exampleGrammar: string;
}

export function QuickGuide({ items, exampleGrammar }: QuickGuideProps) {
  return (
    <article className="glass-card quick-guide">
      <div className="card-title-row">
        <h2>Quick Guide</h2>
        <span>Input format</span>
      </div>

      <ul className="guide-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="grammar-preview">
        <p>Example</p>
        <pre>{exampleGrammar}</pre>
      </div>
    </article>
  );
}
