// Client-side AI integration helper
// Calls the /api/ai endpoint and falls back to templates when no key is set.

export type AITask =
  | "detective_reaction"
  | "why_this_question"
  | "hint"
  | "reconsider"
  | "comeback"
  | "teach_process";

export type AIResponse = {
  text: string;
  model: string;
  isFallback: boolean;
};

// ---- Template fallbacks (when no API key) ----
const TEMPLATES: Record<AITask, (p: any) => string> = {
  detective_reaction: (p) => {
    const reactions: Record<string, string[]> = {
      "1-yes": ["Hmm... interesting 😏", "Achha... clue mil gaya 👀"],
      "2-yes": ["Accha! Ab clues connect ho rahe hain 👀", "Case clear ho raha hai!"],
      "3-yes": ["YES! Ab toh case interesting ho gaya! 😎", "Clues mere favour mein! 🕵️"],
      "1-no": ["Hmmm... NO? 🤔", "Accha... ye clue alag nikla."],
      "2-no": ["Okay... ye case thoda tricky ho raha hai 👀", "Do NO back-to-back... interesting."],
      "3-no": ["BHAI... TEEN NO?! 😳", "Ab dimaag lagana padega! 🧠"],
    };
    const key = `${p.streak}-${p.answer === "yes" || p.answer === "probablyYes" ? "yes" : "no"}`;
    const list = reactions[key] || reactions["1-yes"];
    return list[Math.floor(Math.random() * list.length)];
  },
  why_this_question: (p) => {
    const count = p.topCandidates?.length ?? 0;
    return `This question helps separate the remaining ${count} candidates into two groups with very different profiles.`;
  },
  hint: (p) => {
    return `${p.personality?.name} is strongly associated with ${p.personality?.category ?? "Indian culture"}.`;
  },
  reconsider: () => "Detective Anuman is reconsidering the clues...",
  comeback: () => "WAIT... mujhe ek aur chance do! 😤",
  teach_process: (p) => `Thanks for teaching me about ${p.name}! I'll remember. 🕵️`,
};

// ---- Main function ----
export async function askAI(task: AITask, payload: any): Promise<AIResponse> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, payload }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.isFallback || !data.text) {
      return {
        text: TEMPLATES[task](payload),
        model: "template-fallback",
        isFallback: true,
      };
    }
    return {
      text: data.text,
      model: data.model ?? "unknown",
      isFallback: false,
    };
  } catch (err) {
    return {
      text: TEMPLATES[task](payload),
      model: "template-fallback",
      isFallback: true,
    };
  }
}

// Check model status
export async function getModelStatus(): Promise<{
  selectedModel: string;
  availableProviders: Record<string, boolean>;
  ready: boolean;
  message: string;
}> {
  try {
    const res = await fetch("/api/ai");
    return await res.json();
  } catch {
    return {
      selectedModel: "unknown",
      availableProviders: {},
      ready: false,
      message: "Could not check model status",
    };
  }
}
