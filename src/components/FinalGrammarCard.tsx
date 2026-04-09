interface FinalGrammarCardProps {
  finalStartSymbol: string;
  finalGrammar: string;
}

export function FinalGrammarCard({ finalStartSymbol, finalGrammar }: FinalGrammarCardProps) {
  return (
    <article className="glass-card final-grammar-card">
      <div className="card-title-row">
        <h3>Final Simplified Grammar</h3>
        <span>Start: {finalStartSymbol}</span>
      </div>
      <pre className="grammar-box">{finalGrammar}</pre>
    </article>
  );
}
