export const EPSILON_SYMBOL = "ε";

const EPSILON_TOKENS = new Set(["ε", "ϵ", "epsilon", "eps", "lambda", "λ"]);

export type GrammarToken = string;
export type Alternative = GrammarToken[];

export interface Production {
  lhs: string;
  rhs: Alternative;
}

export type ProductionMap = Record<string, Alternative[]>;

export interface Grammar {
  startSymbol: string;
  nonTerminals: string[];
  productions: ProductionMap;
}

export interface ParseResult {
  grammar: Grammar;
  warnings: string[];
}

export interface SimplificationStep {
  id: number;
  title: string;
  description: string;
  grammarText: string;
  details: string[];
}

export interface SimplificationResult {
  steps: SimplificationStep[];
  warnings: string[];
  finalGrammar: string;
  finalStartSymbol: string;
}

function serializeAlternative(rhs: Alternative): string {
  return rhs.join("\u241f");
}

function uniqueAlternatives(alternatives: Alternative[]): Alternative[] {
  const seen = new Set<string>();
  const unique: Alternative[] = [];

  for (const rhs of alternatives) {
    const key = serializeAlternative(rhs);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(rhs);
  }

  return unique;
}

function formatAlternative(rhs: Alternative): string {
  if (rhs.length === 0) {
    return EPSILON_SYMBOL;
  }

  return rhs.join(" ");
}

export function grammarToText(grammar: Grammar): string {
  if (grammar.nonTerminals.length === 0) {
    return "(empty grammar)";
  }

  return grammar.nonTerminals
    .map((lhs) => {
      const alternatives = grammar.productions[lhs] ?? [];

      if (alternatives.length === 0) {
        return `${lhs} -> (no productions)`;
      }

      return `${lhs} -> ${alternatives.map(formatAlternative).join(" | ")}`;
    })
    .join("\n");
}

function cloneGrammar(grammar: Grammar): Grammar {
  const productions: ProductionMap = {};

  for (const lhs of grammar.nonTerminals) {
    productions[lhs] = (grammar.productions[lhs] ?? []).map((rhs) => [...rhs]);
  }

  return {
    startSymbol: grammar.startSymbol,
    nonTerminals: [...grammar.nonTerminals],
    productions,
  };
}

function isVariableLikeToken(token: string): boolean {
  return /^[A-Z][A-Za-z0-9_']*$/.test(token);
}

function tokenizeAlternative(rawAlternative: string): Alternative {
  const raw = rawAlternative.trim();
  const normalized = raw.toLowerCase();

  if (!raw || EPSILON_TOKENS.has(normalized)) {
    return [];
  }

  if (/\s/.test(raw)) {
    return raw.split(/\s+/).filter(Boolean);
  }

  const compactTokens = raw.match(/[A-Z]'*|[a-z0-9]|[^A-Za-z0-9\s]/g);

  if (!compactTokens) {
    return [raw];
  }

  if (compactTokens.length === 1 && EPSILON_TOKENS.has(compactTokens[0].toLowerCase())) {
    return [];
  }

  return compactTokens;
}

function findUndefinedVariableRefs(grammar: Grammar): string[] {
  const ntSet = new Set(grammar.nonTerminals);
  const undefinedRefs = new Set<string>();

  for (const lhs of grammar.nonTerminals) {
    for (const rhs of grammar.productions[lhs] ?? []) {
      for (const token of rhs) {
        if (!ntSet.has(token) && isVariableLikeToken(token)) {
          undefinedRefs.add(token);
        }
      }
    }
  }

  return [...undefinedRefs].sort();
}

export function parseGrammar(input: string, requestedStartSymbol: string): ParseResult {
  const warnings: string[] = [];
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("Enter at least one production rule.");
  }

  const nonTerminals: string[] = [];
  const seenNonTerminals = new Set<string>();
  const productions: ProductionMap = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const arrow = line.includes("->") ? "->" : line.includes("→") ? "→" : null;

    if (!arrow) {
      throw new Error(`Line ${index + 1}: missing arrow. Use S -> A B | b.`);
    }

    const arrowIndex = line.indexOf(arrow);
    const lhs = line.slice(0, arrowIndex).trim();
    const rhsRaw = line.slice(arrowIndex + arrow.length).trim();

    if (!lhs) {
      throw new Error(`Line ${index + 1}: left side cannot be empty.`);
    }

    if (!seenNonTerminals.has(lhs)) {
      seenNonTerminals.add(lhs);
      nonTerminals.push(lhs);
      productions[lhs] = [];
    }

    const alternatives = rhsRaw.split("|").map((part) => part.trim());

    if (alternatives.length === 0) {
      throw new Error(`Line ${index + 1}: right side cannot be empty.`);
    }

    for (const alt of alternatives) {
      productions[lhs].push(tokenizeAlternative(alt));
    }
  }

  for (const lhs of nonTerminals) {
    productions[lhs] = uniqueAlternatives(productions[lhs]);
  }

  let startSymbol = nonTerminals[0];
  const requested = requestedStartSymbol.trim();

  if (requested.length > 0) {
    if (seenNonTerminals.has(requested)) {
      startSymbol = requested;
    } else {
      warnings.push(
        `Start symbol ${requested} is not defined on the left side; using ${startSymbol} instead.`
      );
    }
  }

  const grammar: Grammar = {
    startSymbol,
    nonTerminals,
    productions,
  };

  const undefinedVariableRefs = findUndefinedVariableRefs(grammar);

  if (undefinedVariableRefs.length > 0) {
    warnings.push(
      `Undefined variable-like symbols found: ${undefinedVariableRefs.join(", ")}. Rules using them are removed in Step 1.`
    );
  }

  return {
    grammar,
    warnings,
  };
}

function computeNullable(grammar: Grammar): Set<string> {
  const nullable = new Set<string>();
  const ntSet = new Set(grammar.nonTerminals);
  let changed = true;

  while (changed) {
    changed = false;

    for (const lhs of grammar.nonTerminals) {
      if (nullable.has(lhs)) {
        continue;
      }

      const alternatives = grammar.productions[lhs] ?? [];
      const hasNullableAlternative = alternatives.some((rhs) => {
        if (rhs.length === 0) {
          return true;
        }

        return rhs.every((token) => ntSet.has(token) && nullable.has(token));
      });

      if (hasNullableAlternative) {
        nullable.add(lhs);
        changed = true;
      }
    }
  }

  return nullable;
}

function generateNullableCombinations(
  rhs: Alternative,
  nullable: Set<string>,
  ntSet: Set<string>
): Alternative[] {
  const generated: Alternative[] = [];

  const visit = (index: number, buffer: string[]) => {
    if (index === rhs.length) {
      if (buffer.length > 0) {
        generated.push([...buffer]);
      }

      return;
    }

    const token = rhs[index];

    if (ntSet.has(token) && nullable.has(token)) {
      visit(index + 1, buffer);
    }

    buffer.push(token);
    visit(index + 1, buffer);
    buffer.pop();
  };

  visit(0, []);

  return generated;
}

function createFreshStartSymbol(base: string, used: Set<string>): string {
  let candidate = `${base}'`;

  while (used.has(candidate)) {
    candidate = `${candidate}'`;
  }

  return candidate;
}

function rhsIsGenerating(rhs: Alternative, generating: Set<string>, ntSet: Set<string>): boolean {
  for (const token of rhs) {
    if (ntSet.has(token)) {
      if (!generating.has(token)) {
        return false;
      }

      continue;
    }

    if (isVariableLikeToken(token)) {
      return false;
    }
  }

  return true;
}

function rhsReferencesOnlyKnownGenerating(rhs: Alternative, generating: Set<string>, ntSet: Set<string>): boolean {
  return rhs.every((token) => {
    if (ntSet.has(token)) {
      return generating.has(token);
    }

    return !isVariableLikeToken(token);
  });
}

export function removeUselessSymbols(grammar: Grammar): { grammar: Grammar; details: string[] } {
  const ntSet = new Set(grammar.nonTerminals);
  const undefinedRefs = findUndefinedVariableRefs(grammar);
  const generating = new Set<string>();

  let changed = true;

  while (changed) {
    changed = false;

    for (const lhs of grammar.nonTerminals) {
      if (generating.has(lhs)) {
        continue;
      }

      const alternatives = grammar.productions[lhs] ?? [];
      const canGenerate = alternatives.some((rhs) => rhsIsGenerating(rhs, generating, ntSet));

      if (canGenerate) {
        generating.add(lhs);
        changed = true;
      }
    }
  }

  const removedNonGenerating = grammar.nonTerminals.filter(
    (lhs) => !generating.has(lhs) && lhs !== grammar.startSymbol
  );

  const phaseAKeep = grammar.nonTerminals.filter(
    (lhs) => generating.has(lhs) || lhs === grammar.startSymbol
  );

  const phaseAProductions: ProductionMap = {};

  for (const lhs of phaseAKeep) {
    phaseAProductions[lhs] = (grammar.productions[lhs] ?? []).filter((rhs) =>
      rhsReferencesOnlyKnownGenerating(rhs, generating, ntSet)
    );
  }

  const reachable = new Set<string>([grammar.startSymbol]);
  const queue: string[] = [grammar.startSymbol];
  const phaseASet = new Set(phaseAKeep);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || !phaseASet.has(current)) {
      continue;
    }

    for (const rhs of phaseAProductions[current] ?? []) {
      for (const token of rhs) {
        if (phaseASet.has(token) && !reachable.has(token)) {
          reachable.add(token);
          queue.push(token);
        }
      }
    }
  }

  const removedUnreachable = phaseAKeep.filter(
    (lhs) => !reachable.has(lhs) && lhs !== grammar.startSymbol
  );

  const finalNonTerminals = phaseAKeep.filter(
    (lhs) => reachable.has(lhs) || lhs === grammar.startSymbol
  );

  const finalProductions: ProductionMap = {};

  for (const lhs of finalNonTerminals) {
    finalProductions[lhs] = uniqueAlternatives(phaseAProductions[lhs] ?? []);
  }

  return {
    grammar: {
      startSymbol: grammar.startSymbol,
      nonTerminals: finalNonTerminals,
      productions: finalProductions,
    },
    details: [
      `Generating variables: ${[...generating].sort().join(", ") || "none"}.`,
      `Undefined variable-like references treated as non-generating: ${undefinedRefs.join(", ") || "none"}.`,
      `Removed non-generating variables: ${removedNonGenerating.join(", ") || "none"}.`,
      `Removed unreachable variables: ${removedUnreachable.join(", ") || "none"}.`,
    ],
  };
}

export function eliminateNullProductions(grammar: Grammar): { grammar: Grammar; details: string[] } {
  const working = cloneGrammar(grammar);
  const usedSymbols = new Set(working.nonTerminals);
  let nullable = computeNullable(working);
  let addedStart: string | null = null;

  if (nullable.has(working.startSymbol)) {
    addedStart = createFreshStartSymbol(working.startSymbol, usedSymbols);
    working.nonTerminals = [addedStart, ...working.nonTerminals];
    working.productions[addedStart] = [[working.startSymbol], []];
    working.startSymbol = addedStart;
    usedSymbols.add(addedStart);
    nullable = computeNullable(working);
  }

  const ntSet = new Set(working.nonTerminals);
  const nextProductions: ProductionMap = {};
  let removedNullCount = 0;

  for (const lhs of working.nonTerminals) {
    const generated: Alternative[] = [];

    for (const rhs of working.productions[lhs] ?? []) {
      if (rhs.length === 0) {
        removedNullCount += 1;
        continue;
      }

      generated.push(...generateNullableCombinations(rhs, nullable, ntSet));
    }

    if (addedStart && lhs === working.startSymbol) {
      generated.push([]);
    }

    nextProductions[lhs] = uniqueAlternatives(generated);
  }

  return {
    grammar: {
      startSymbol: working.startSymbol,
      nonTerminals: working.nonTerminals,
      productions: nextProductions,
    },
    details: [
      `Nullable variables: ${[...nullable].sort().join(", ") || "none"}.`,
      addedStart
        ? `Start symbol was nullable, so ${addedStart} -> ${grammar.startSymbol} | ${EPSILON_SYMBOL} was introduced.`
        : "Start symbol was not nullable, so no new start symbol was introduced.",
      `Removed ${removedNullCount} explicit null production(s).`,
    ],
  };
}

export function removeUnitProductions(grammar: Grammar): { grammar: Grammar; details: string[] } {
  const ntSet = new Set(grammar.nonTerminals);
  const unitGraph: Record<string, Set<string>> = {};
  let unitCount = 0;

  for (const lhs of grammar.nonTerminals) {
    unitGraph[lhs] = new Set<string>();

    for (const rhs of grammar.productions[lhs] ?? []) {
      if (rhs.length === 1 && ntSet.has(rhs[0])) {
        unitGraph[lhs].add(rhs[0]);
        unitCount += 1;
      }
    }
  }

  const closureMap: Record<string, Set<string>> = {};

  for (const lhs of grammar.nonTerminals) {
    const visited = new Set<string>([lhs]);
    const queue = [lhs];

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current) {
        continue;
      }

      for (const next of unitGraph[current] ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }

    closureMap[lhs] = visited;
  }

  const nextProductions: ProductionMap = {};

  for (const lhs of grammar.nonTerminals) {
    const accumulated: Alternative[] = [];

    for (const target of closureMap[lhs]) {
      for (const rhs of grammar.productions[target] ?? []) {
        const isUnitRule = rhs.length === 1 && ntSet.has(rhs[0]);

        if (!isUnitRule) {
          accumulated.push([...rhs]);
        }
      }
    }

    nextProductions[lhs] = uniqueAlternatives(accumulated);
  }

  return {
    grammar: {
      startSymbol: grammar.startSymbol,
      nonTerminals: [...grammar.nonTerminals],
      productions: nextProductions,
    },
    details: [
      `Detected ${unitCount} unit production(s).`,
      "Computed full unit-closure pairs (A, B) for all variables.",
      "Substituted non-unit productions and removed all unit rules.",
    ],
  };
}

export function simplifyGrammar(input: string, startSymbol: string): SimplificationResult {
  const parsed = parseGrammar(input, startSymbol);

  const step0: SimplificationStep = {
    id: 0,
    title: "Step 0: Original Grammar",
    description: "Initial CFG as parsed from input.",
    grammarText: grammarToText(parsed.grammar),
    details: ["Start symbol: " + parsed.grammar.startSymbol],
  };

  const step1Result = eliminateNullProductions(parsed.grammar);
  const step1: SimplificationStep = {
    id: 1,
    title: "Step 1: Eliminate Null Productions",
    description: "Nullable variables expanded and explicit epsilon rules removed.",
    grammarText: grammarToText(step1Result.grammar),
    details: step1Result.details,
  };

  const step2Result = removeUnitProductions(step1Result.grammar);
  const step2: SimplificationStep = {
    id: 2,
    title: "Step 2: Remove Unit Productions",
    description: "Unit-closure substitution removes all unit rules.",
    grammarText: grammarToText(step2Result.grammar),
    details: step2Result.details,
  };

  const step3Result = removeUselessSymbols(step2Result.grammar);
  const step3: SimplificationStep = {
    id: 3,
    title: "Step 3: Remove Useless Symbols",
    description: "Phase A (generating) then Phase B (reachable).",
    grammarText: grammarToText(step3Result.grammar),
    details: step3Result.details,
  };

  return {
    steps: [step0, step1, step2, step3],
    warnings: parsed.warnings,
    finalGrammar: grammarToText(step3Result.grammar),
    finalStartSymbol: step3Result.grammar.startSymbol,
  };
}
