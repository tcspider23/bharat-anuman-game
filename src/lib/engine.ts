// Adaptive AI engine for Bharat Anuman.
// Picks questions by expected information gain (entropy reduction) across the candidate pool.

import { getAllPersonalities, type Category, type Personality } from "./knowledge";
import { QUESTIONS, type Question, type Answer } from "./questions";

export type CandidateState = {
  id: string;
  prob: number;
};

export type GameState = {
  candidates: CandidateState[];
  remainingQuestions: string[];
  askedQuestions: { id: string; answer: Answer; question: Question }[];
  currentCategory: Category | null;
  questionCount: number;
  score: number;
  confidence: number;
  yesStreak: number;
  noStreak: number;
  recentAnswers: Answer[];
  mode: string;
  realCategory: Category | null; // for "surprise" mode, the actual category
  difficulty: "easy" | "medium" | "hard";
  /** Personalities the player rejected as wrong guesses — probability forced to 0 */
  excludedIds: string[];
  /** Do not guess again before this question count (set after a rejected guess) */
  minQuestionsForGuess: number;
};

// ============ Initial category filtering ============
export function getInitialCandidates(mode: string): Personality[] {
  const all = getAllPersonalities();
  switch (mode) {
    case "cricket":
      return all.filter((p) => p.category === "cricket");
    case "bollywood":
      return all.filter((p) => p.category === "bollywood");
    case "music":
      // Music mode = dedicated musicians + any cinema person primarily known
      // as a singer/composer (e.g. Lata Mangeshkar, Kishore Kumar).
      return all.filter(
        (p) =>
          p.category === "music" ||
          !!p.traits.isSinger ||
          !!p.traits.isPlayback ||
          !!p.traits.isMusicComposer
      );
    case "sports":
      return all.filter((p) => p.category === "sports" || p.category === "cricket");
    case "business":
      return all.filter((p) => p.category === "business");
    case "entertainment":
      return all.filter((p) => p.category === "entertainment" || p.category === "bollywood");
    case "famousIndia":
    case "mixed":
      return all;
    case "rapid":
    case "challenge":
      return all;
    case "surprise": {
      // Pick random real category
      const cats: Category[] = ["cricket", "bollywood", "sports", "music", "business", "entertainment", "famousIndia"];
      const c = cats[Math.floor(Math.random() * cats.length)];
      return all.filter((p) => p.category === c);
    }
    default:
      return all;
  }
}

export function getRealCategory(mode: string, initialCandidates: Personality[]): Category | null {
  if (mode === "surprise") {
    const cats = Array.from(new Set(initialCandidates.map((p) => p.category)));
    return cats[0] ?? null;
  }
  if (["cricket", "bollywood", "music", "sports", "business", "entertainment", "famousIndia", "mixed"].includes(mode)) {
    return mode as Category;
  }
  return null;
}

// ============ Create initial state ============
export function createInitialState(mode: string, difficulty: "easy" | "medium" | "hard" = "medium"): GameState {
  const initial = getInitialCandidates(mode);
  const uniform = 1 / initial.length;
  const candidates: CandidateState[] = initial.map((p) => ({ id: p.id, prob: uniform }));
  const realCategory = getRealCategory(mode, initial);
  return {
    candidates,
    remainingQuestions: QUESTIONS.map((q) => q.id),
    askedQuestions: [],
    currentCategory: realCategory,
    questionCount: 0,
    score: 1000,
    confidence: 0,
    yesStreak: 0,
    noStreak: 0,
    recentAnswers: [],
    mode,
    realCategory,
    difficulty,
    excludedIds: [],
    minQuestionsForGuess: 0,
  };
}

// ============ Exclude a wrongly-guessed candidate ============
export function excludeCandidate(state: GameState, id: string): GameState {
  const candidates = state.candidates.map((c) => (c.id === id ? { ...c, prob: 0 } : c));
  const total = candidates.reduce((s, c) => s + c.prob, 0);
  const renorm =
    total > 0 ? candidates.map((c) => ({ ...c, prob: c.prob / total })) : candidates;
  return {
    ...state,
    candidates: renorm,
    excludedIds: state.excludedIds.includes(id)
      ? state.excludedIds
      : [...state.excludedIds, id],
    // Give the AI at least 2 fresh questions before it may guess again
    minQuestionsForGuess: state.questionCount + 2,
  };
}

// ============ Compute entropy of a probability distribution ============
function entropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p <= 0) continue;
    h -= p * Math.log2(p);
  }
  return h;
}

// ============ Expected information gain of a question ============
function expectedInfoGain(
  question: Question,
  candidates: CandidateState[],
  pool: Personality[]
): number {
  const probYesArr = candidates.filter((c) => {
    const p = pool.find((x) => x.id === c.id);
    return p && question.ask(p);
  });
  const probNoArr = candidates.filter((c) => {
    const p = pool.find((x) => x.id === c.id);
    return p && !question.ask(p);
  });
  const pYes = probYesArr.reduce((s, c) => s + c.prob, 0);
  const pNo = 1 - pYes;
  // Skip questions where the split is lopsided (<8% either side) —
  // those feel like unnecessary/redundant questions to the player.
  if (pYes <= 0.08 || pNo <= 0.08) return 0; // uninformative

  const totalProb = candidates.reduce((s, c) => s + c.prob, 0);
  const hBefore = entropy(candidates.map((c) => c.prob / totalProb));
  const hYes = entropy(probYesArr.map((c) => c.prob / Math.max(pYes, 0.0001)));
  const hNo = entropy(probNoArr.map((c) => c.prob / Math.max(pNo, 0.0001)));
  const hAfter = pYes * hYes + pNo * hNo;
  return hBefore - hAfter;
}

// ============ Build the set of candidate ids that answer "yes" to a question ============
function yesSet(question: Question, pool: Personality[]): Set<string> {
  const s = new Set<string>();
  for (const p of pool) if (question.ask(p)) s.add(p.id);
  return s;
}

// ============ Pick the best question ============
export function pickBestQuestion(state: GameState): Question | null {
  const pool = getAllPersonalities();
  const total = state.candidates.reduce((s, c) => s + c.prob, 0);
  if (total <= 0) return null;

  // Category-specific questions unlock when their category has real mass in the
  // pool (e.g. cricket questions become available once cricket dominates), even
  // in mixed mode. This keeps questioning relevant to the actual suspects.
  const cMass = categoryMass(state.candidates, pool);

  const available = QUESTIONS.filter((q) => {
    if (!state.remainingQuestions.includes(q.id)) return false;
    if (!q.categories || q.categories.length === 0) return true;
    if (state.currentCategory && q.categories.includes(state.currentCategory)) return true;
    return q.categories.some((c) => (cMass.get(c) || 0) >= 0.1);
  });

  if (available.length === 0) return null;

  // Enforce redundancy caps per question group so we never ask two variants of
  // the same dimension (e.g. two different birth-decade questions).
  const askedGroups: Record<string, number> = {};
  for (const aq of state.askedQuestions) {
    const g = aq.question.group;
    if (g) askedGroups[g] = (askedGroups[g] || 0) + 1;
  }
  // Era buckets are clean, non-overlapping discriminators — allow several so the
  // AI can binary-search the generation when the pool is down to a handful.
  // regionState = fine-grained state questions used late-game to break ties.
  const groupCaps: Record<string, number> = { era: 5, region: 2, regionState: 3 };

  // Precompute yes-sets for every available question AND every previously asked
  // question (used for the consistency checks). Caching avoids re-scanning the
  // whole pool repeatedly, which matters once the catalog is large.
  const yesSetCache = new Map<string, Set<string>>();
  for (const q of available) yesSetCache.set(q.id, yesSet(q, pool));
  for (const aq of state.askedQuestions) {
    if (!yesSetCache.has(aq.id)) {
      yesSetCache.set(aq.id, yesSet(aq.question, pool));
    }
  }

  // Stage preference based on number of questions asked
  let targetStage = "broad";
  if (state.questionCount >= 2) targetStage = "category";
  if (state.questionCount >= 5) targetStage = "profession";
  if (state.questionCount >= 10) targetStage = "specific";
  if (state.candidates.length <= 10) targetStage = "specific";

  // Stages already used recently — avoid asking two of the same "type" in a row,
  // which is what makes questions feel repetitive / unnecessary.
  const recentStages = state.askedQuestions.slice(-3).map((a) => a.question.stage);

  const scored: { q: Question; score: number }[] = [];

  const lastAsked = state.askedQuestions[state.askedQuestions.length - 1];

  for (const q of available) {
    let ig = expectedInfoGain(q, state.candidates, pool);
    if (ig <= 0) continue;

    // Group cap: don't ask a second/third variant of the same dimension
    if (q.group && groupCaps[q.group] !== undefined && (askedGroups[q.group] || 0) >= groupCaps[q.group]) {
      continue;
    }

    const qYes = yesSetCache.get(q.id);
    if (!qYes) continue;

    // ---- Answer-history consistency ----
    // If a previous answer logically makes this question pointless, skip it.
    //   * Previous YES  on Q1, and Q and Q1 share NO candidates  -> Q is guaranteed NO -> skip
    //   * Previous NO   on Q1, and every Q-yes also answers Q1-yes -> Q is guaranteed NO -> skip
    let skip = false;
    let penalty = 1;
    for (const aq of state.askedQuestions) {
      const prevYes = yesSetCache.get(aq.id);
      if (!prevYes) continue;

      // overlap between the two "yes" sets
      let overlap = 0;
      for (const id of qYes) if (prevYes.has(id)) overlap++;

      // is qYes a subset of prevYes?
      let subset = true;
      for (const id of qYes) if (!prevYes.has(id)) { subset = false; break; }

      // is prevYes a subset of qYes? (reverse direction)
      let prevSubset = true;
      for (const id of prevYes) if (!qYes.has(id)) { prevSubset = false; break; }

      if (aq.answer === "yes") {
        // player confirmed prev=true.
        // If nobody who answers Q-yes also answers prev-yes -> Q is guaranteed NO -> skip
        if (overlap === 0) { skip = true; break; }
        // If every prev-yes person also answers Q-yes -> Q is guaranteed YES -> skip
        // (e.g. "IPL icon = YES" already implies "cricketer = YES")
        if (prevSubset && qYes.size > 0) { skip = true; break; }
      } else if (aq.answer === "no") {
        // player confirmed prev=false. If every Q-yes person also has prev=true,
        // then Q is a guaranteed NO — pointless.
        if (subset && qYes.size > 0) { skip = true; break; }
      } else if (aq.answer === "probablyYes") {
        if (overlap === 0) penalty *= 0.3;
        if (prevSubset && qYes.size > 0) penalty *= 0.3;
      } else if (aq.answer === "probablyNo") {
        if (subset && qYes.size > 0) penalty *= 0.3;
      }
    }
    if (skip) continue;

    let score = ig * penalty;
    // Boost question if its stage matches the current progression
    if (q.stage === targetStage) score *= 1.2;
    // Small penalty for "broad" questions late in the game
    if (q.stage === "broad" && state.questionCount >= 5) score *= 0.5;
    // Penalize repeating a question-stage we just asked (feels redundant)
    if (recentStages.includes(q.stage)) score *= 0.55;
    // If the last answer was "don't know", strongly avoid the same stage again —
    // the player just told us that dimension didn't help, so changing angle.
    if (lastAsked && lastAsked.answer === "dontKnow" && lastAsked.question.stage === q.stage) {
      score *= 0.3;
    }

    scored.push({ q, score });
  }

  // If we're in intense brain mode (3 NOs), also boost questions that separate top candidates
  if (state.noStreak >= 3) {
    for (const s of scored) {
      if (s.q.stage === "category" || s.q.stage === "profession") s.score *= 1.3;
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.q ?? null;
}

// ============ Why this question ============
export function explainQuestion(question: Question, state: GameState): string {
  const pool = getAllPersonalities();
  const total = state.candidates.reduce((s, c) => s + c.prob, 0);
  const yesCount = state.candidates.filter((c) => {
    const p = pool.find((x) => x.id === c.id);
    return p && question.ask(p);
  }).length;
  const noCount = state.candidates.length - yesCount;
  return `This question helps separate the remaining ${state.candidates.length} candidates into two groups: about ${yesCount} who match and ${noCount} who don't.`;
}

// ============ Hint for the current top candidate ============
export function giveHint(state: GameState): string {
  const top = [...state.candidates].sort((a, b) => b.prob - a.prob)[0];
  if (!top) return "Hmm, I have no candidates left.";
  const p = getAllPersonalities().find((x) => x.id === top.id);
  if (!p) return "I need to think more.";
  const hints = [
    `This person is strongly associated with ${p.category === "famousIndia" ? "Indian history or public life" : p.category}.`,
    `Their profession is related to ${p.profession}.`,
    p.famousFor,
  ];
  return hints[Math.floor(Math.random() * hints.length)];
}

// ============ Update state after an answer ============
export function applyAnswer(state: GameState, questionId: string, answer: Answer): GameState {
  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) return state;

  const pool = getAllPersonalities();

  // Likelihood multipliers — sharpened so confidence builds in 6-12 questions
  // instead of dragging to 20.
  const multiplier: Record<Answer, { yes: number; no: number }> = {
    yes: { yes: 1.6, no: 0.06 },
    probablyYes: { yes: 1.15, no: 0.28 },
    dontKnow: { yes: 1.0, no: 1.0 },
    probablyNo: { yes: 0.28, no: 1.15 },
    no: { yes: 0.06, no: 1.6 },
  };
  const m = multiplier[answer];

  // Update probabilities
  let newCandidates = state.candidates.map((c) => {
    const p = pool.find((x) => x.id === c.id);
    if (!p) return c;
    const matches = question.ask(p);
    const factor = matches ? m.yes : m.no;
    return { ...c, prob: c.prob * factor };
  });

  // Normalize
  const total = newCandidates.reduce((s, c) => s + c.prob, 0);
  if (total > 0) {
    newCandidates = newCandidates.map((c) => ({ ...c, prob: c.prob / total }));
  }

  // Streaks
  let yesStreak = state.yesStreak;
  let noStreak = state.noStreak;
  if (answer === "yes" || answer === "probablyYes") {
    yesStreak += 1;
    noStreak = 0;
  } else if (answer === "no" || answer === "probablyNo") {
    noStreak += 1;
    yesStreak = 0;
  } else {
    yesStreak = 0;
    noStreak = 0;
  }

  // Score: reduce with each question
  let score = Math.max(0, state.score - 40);

  // Recent answers
  const recent = [...state.recentAnswers, answer].slice(-5);

  // Detect if the remaining pool is now dominated by one category. This unlocks
  // category-specific questions (cricket/music/etc) in mixed/explore modes, which
  // is what makes the questioning feel relevant instead of generic. We only
  // override when we're currently "mixed"/null so we don't clobber a fixed mode.
  const domCat = dominantCategory(newCandidates, pool);
  const isExploreMode = !state.currentCategory || state.currentCategory === ("mixed" as Category);
  const currentCategory = isExploreMode && domCat ? domCat : state.currentCategory;

  return {
    ...state,
    candidates: newCandidates,
    remainingQuestions: state.remainingQuestions.filter((id) => id !== questionId),
    askedQuestions: [...state.askedQuestions, { id: questionId, answer, question }],
    questionCount: state.questionCount + 1,
    score,
    yesStreak,
    noStreak,
    recentAnswers: recent,
    currentCategory,
    confidence: newCandidates.length > 0 ? Math.max(...newCandidates.map((c) => c.prob)) : 0,
  };
}

// ============ Dominant category detection ============
function dominantCategory(candidates: CandidateState[], pool: Personality[]): Category | null {
  const mass: Record<string, number> = {};
  for (const c of candidates) {
    const p = pool.find((x) => x.id === c.id);
    if (p) mass[p.category] = (mass[p.category] || 0) + c.prob;
  }
  const total = Object.values(mass).reduce((a, b) => a + b, 0) || 1;
  let best: string | null = null;
  let bestM = 0;
  for (const [k, v] of Object.entries(mass)) {
    if (v / total > bestM) {
      best = k;
      bestM = v / total;
    }
  }
  // Only "lock" the category once it clearly dominates the pool
  return bestM >= 0.7 ? (best as Category) : null;
}

// ============ Category mass (used to unlock category-specific questions) ============
function categoryMass(candidates: CandidateState[], pool: Personality[]): Map<Category, number> {
  const mass = new Map<Category, number>();
  const total = candidates.reduce((s, c) => s + c.prob, 0) || 1;
  for (const c of candidates) {
    const p = pool.find((x) => x.id === c.id);
    if (p) mass.set(p.category, (mass.get(p.category) || 0) + c.prob / total);
  }
  return mass;
}

// ============ Get top candidates ============
export function getTopCandidates(state: GameState, n = 5): { personality: Personality; prob: number }[] {
  const pool = getAllPersonalities();
  const resolved = [...state.candidates]
    .sort((a, b) => b.prob - a.prob)
    .map((c) => ({
      personality: pool.find((p) => p.id === c.id)!,
      prob: c.prob,
    }))
    .filter((x) => x.personality);

  // Prefer curated named personalities in the live panel and final guess.
  // Expanded catalog profiles still participate in the candidate count and
  // probability calculations, but do not obscure a meaningful named result.
  const named = resolved.filter((x) => !x.personality.isCatalogProfile);
  return (named.length >= n ? named : resolved).slice(0, n);
}

// ============ Check if we're ready to guess ============
export function shouldGuess(state: GameState): boolean {
  if (state.candidates.length === 0) return false;
  const top = getTopCandidates(state, 1)[0];
  if (!top) return false;

  // Never re-guess a personality the player already rejected
  if (state.excludedIds.includes(top.personality.id)) return false;

  // HIGHEST PRIORITY — if there is no useful question left to ask, we MUST
  // guess. This must win over the "min questions" guard below, otherwise the
  // game can deadlock right after a rejected guess (stuck on "next question...").
  if (state.questionCount > 0 && !pickBestQuestion(state)) return true;

  // After a rejected guess, insist on asking at least a couple of fresh
  // questions before guessing again (avoids instant same/low-confidence re-guess)
  if (state.questionCount < state.minQuestionsForGuess) return false;

  // Threshold varies by difficulty — tuned so a confident answer usually
  // arrives in 6-14 questions, not 20.
  const threshold = state.difficulty === "easy" ? 0.5 : state.difficulty === "hard" ? 0.7 : 0.55;

  // Early guess when the pool is already tiny and one suspect clearly leads
  const aliveCount = state.candidates.filter((c) => c.prob > 0).length;
  if (aliveCount <= 10 && top.prob >= 0.35) return true;

  // Force a decision before the game drags on
  const forceAt = state.mode === "rapid" ? 10 : state.mode === "challenge" ? 15 : 14;
  return top.prob >= threshold || state.questionCount >= forceAt || state.remainingQuestions.length === 0;
}

// ============ Get final guess ============
export function getFinalGuess(state: GameState): Personality | null {
  const pool = getAllPersonalities();
  const ranked = [...state.candidates]
    .filter((c) => !state.excludedIds.includes(c.id) && c.prob > 0)
    .sort((a, b) => b.prob - a.prob);
  const top = ranked[0];
  return top ? pool.find((p) => p.id === top.id) ?? null : null;
}

// ============ Contradiction detection ============
export function detectContradiction(state: GameState): boolean {
  if (state.askedQuestions.length < 3) return false;
  // Look at recent answers: if they swing yes then no on related questions, suspicious
  const last3 = state.askedQuestions.slice(-3);
  const answers = last3.map((q) => q.answer);
  const yesCount = answers.filter((a) => a === "yes" || a === "probablyYes").length;
  const noCount = answers.filter((a) => a === "no" || a === "probablyNo").length;
  return yesCount >= 2 && noCount >= 1 && state.confidence < 0.3;
}
