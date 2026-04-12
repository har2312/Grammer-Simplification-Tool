"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface InputSectionProps {
  startSymbol: string;
  grammarInput: string;
  errorMessage: string;
  onStartSymbolChange: (value: string) => void;
  onGrammarChange: (value: string) => void;
  onSimplify: () => void;
  onLoadExample: () => void;
  onClear: () => void;
}

export function InputSection({
  startSymbol,
  grammarInput,
  errorMessage,
  onStartSymbolChange,
  onGrammarChange,
  onSimplify,
  onLoadExample,
  onClear,
}: InputSectionProps) {
  const [showHint, setShowHint] = useState(false);
  const [hasDismissedHint, setHasDismissedHint] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);

  const formatGrammarInput = (value: string) => {
    let formatted = value.replace(/\bnull\b/gi, "ε");
    formatted = formatted.replace(/^([A-Z]'?)[ \t]$/gm, "$1 -> ");

    return formatted;
  };

  const triggerHint = () => {
    if (!hasDismissedHint && !showHint) {
      setShowHint(true);
    }
  };

  useLayoutEffect(() => {
    const pending = pendingSelectionRef.current;
    const textarea = textareaRef.current;

    if (!pending || !textarea) {
      return;
    }

    if (document.activeElement === textarea) {
      textarea.setSelectionRange(pending.start, pending.end);
    }

    pendingSelectionRef.current = null;
  }, [grammarInput]);

  const handleGrammarChange = (rawValue: string, selectionStart: number, selectionEnd: number) => {
    triggerHint();
    const nextValue = formatGrammarInput(rawValue);
    const nextStart = formatGrammarInput(rawValue.slice(0, selectionStart)).length;
    const nextEnd = formatGrammarInput(rawValue.slice(0, selectionEnd)).length;

    pendingSelectionRef.current = { start: nextStart, end: nextEnd };
    onGrammarChange(nextValue);
  };

  return (
    <article className="glass-card input-section">
      <div className="card-title-row">
        <h2>Input Grammar</h2>
        <span>Ready in one click</span>
      </div>

      <label htmlFor="start-symbol">Start Symbol</label>
      <input
        id="start-symbol"
        value={startSymbol}
        onChange={(event) => {
          triggerHint();
          onStartSymbolChange(event.target.value);
        }}
        placeholder="S"
      />

      <label htmlFor="grammar-input">Productions</label>
      <textarea
        ref={textareaRef}
        className="grammar-textarea"
        id="grammar-input"
        value={grammarInput}
        onChange={(event) =>
          handleGrammarChange(
            event.target.value,
            event.target.selectionStart,
            event.target.selectionEnd
          )
        }
        placeholder="S -> A B | b"
        rows={5}
      />

      {showHint && (
        <div className="floating-typing-hint glass-card">
          <p>💡 Magic Typing: Type &apos;null&apos; for ε, and press Space after a Capital letter for an arrow!</p>
          <button
            className="primary"
            onClick={() => {
              setShowHint(false);
              setHasDismissedHint(true);
            }}
          >
            Got it!
          </button>
        </div>
      )}

      <div className="button-row input-actions">
        <button className="primary" onClick={onSimplify}>
          Simplify Grammar
        </button>
        <button className="secondary" onClick={onLoadExample}>
          Load Example
        </button>
        <button className="ghost" onClick={onClear}>
          Clear
        </button>
      </div>

      {errorMessage && <p className="error-box">{errorMessage}</p>}
    </article>
  );
}
