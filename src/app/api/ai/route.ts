import { NextRequest, NextResponse } from "next/server";

// ============================================
// BHARAT ANUMAN — AI MODEL INTEGRATION
// ============================================
// Uses an LLM for natural language AI tasks:
//   - Generating detective dialogue / reactions
//   - Creating contextual hints
//   - Explaining "why this question?"
//   - Processing "Teach Predictor" inputs
//   - Coming up with high-information follow-ups
//
// Supported models (pick ONE via AI_MODEL env):
//   1. Groq        — Llama 3.3 70B (FREE, FAST) ⭐ RECOMMENDED
//   2. Gemini      — Gemini 1.5 Flash (FREE tier)
//   3. OpenAI      — GPT-4o-mini (PAID)
//
// If no API key is configured, falls back to template responses.
// ============================================

export const runtime = "nodejs";

type ModelName = "groq" | "gemini" | "openai";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// ---- Groq (Llama 3.3 / Mixtral) ----
async function callGroq(messages: ChatMessage[], model = "llama-3.3-70b-versatile"): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 400,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ---- Google Gemini ----
async function callGemini(messages: ChatMessage[], model = "gemini-1.5-flash"): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  const systemMsg = messages.find((m) => m.role === "system");
  const userMsgs = messages.filter((m) => m.role !== "system");
  const contents = userMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const body: any = { contents };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

// ---- OpenAI (GPT-4o-mini) ----
async function callOpenAI(messages: ChatMessage[], model = "gpt-4o-mini"): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 400,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ---- Dispatcher ----
async function callModel(messages: ChatMessage[]): Promise<{ text: string; model: string }> {
  const chosen: ModelName = (process.env.AI_MODEL as ModelName) || "groq";
  let usedModel: string = chosen;
  const keyMap: Record<ModelName, string | undefined> = {
    groq: process.env.GROQ_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
  };
  const hasAny = Object.values(keyMap).some(Boolean);
  if (!hasAny) {
    // No keys — return fallback marker so client can use templates
    return { text: "__FALLBACK__", model: "fallback" };
  }
  let text = "";
  try {
    if (chosen === "groq" && keyMap.groq) {
      text = await callGroq(messages);
      usedModel = "llama-3.3-70b (Groq)";
    } else if (chosen === "gemini" && keyMap.gemini) {
      text = await callGemini(messages);
      usedModel = "gemini-1.5-flash";
    } else if (chosen === "openai" && keyMap.openai) {
      text = await callOpenAI(messages);
      usedModel = "gpt-4o-mini";
    } else {
      // fall back to whatever key is available
      if (keyMap.groq) { text = await callGroq(messages); usedModel = "llama-3.3-70b (Groq)"; }
      else if (keyMap.gemini) { text = await callGemini(messages); usedModel = "gemini-1.5-flash"; }
      else if (keyMap.openai) { text = await callOpenAI(messages); usedModel = "gpt-4o-mini"; }
    }
  } catch (e) {
    return { text: "__FALLBACK__", model: "fallback" };
  }
  return { text, model: usedModel };
}

// ---- Main API handler ----
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, payload } = body as { task: string; payload: any };

    let systemPrompt = "";
    let userPrompt = "";

    switch (task) {
      case "detective_reaction": {
        // payload: { streak, answer, question, lang }
        systemPrompt =
          "You are Detective Anuman, a friendly Indian detective with a magnifying glass. " +
          "React briefly (1-2 sentences, max 80 chars) to the user's answer based on the streak. " +
          "Use natural Hinglish (mix of Hindi + English). Be playful, not scary. " +
          "Return ONLY the reaction line, no quotes.";
        userPrompt = `Streak: ${payload.streak} consecutive ${payload.answer} answers.\nRecent question was: "${payload.question}"\nLanguage: ${payload.lang}\nGive me your reaction.`;
        break;
      }
      case "why_this_question": {
        // payload: { question, topCandidates }
        systemPrompt =
          "You are Detective Anuman explaining why you're asking a specific question. " +
          "Explain in 1-2 short sentences how the question helps narrow the suspects. " +
          "Be clear, concise, and friendly. Return ONLY the explanation.";
        const topList = payload.topCandidates.map((c: any) => `${c.name} (${c.profession})`).join(", ");
        userPrompt = `Question: "${payload.question}"\nTop remaining suspects: ${topList || "unknown"}\nWhy are you asking this?`;
        break;
      }
      case "hint": {
        // payload: { personality, lang }
        systemPrompt =
          "You are Detective Anuman giving a helpful HINT about a personality WITHOUT revealing who it is. " +
          "The hint should be useful but not give away the answer. 1-2 sentences max. Return ONLY the hint.";
        userPrompt = `Personality: ${payload.personality.name}\nProfession: ${payload.personality.profession}\nFamous for: ${payload.personality.famousFor}\nGive a hint (in ${payload.lang}).`;
        break;
      }
      case "reconsider": {
        // payload: { recentAnswers, questions, lang }
        systemPrompt =
          "You are Detective Anuman. You just got 3 NO answers in a row. You're confused but determined. " +
          "Say 1-2 sentences (Hinglish, max 80 chars) expressing that you'll use your brain harder now. " +
          "Return ONLY the line.";
        userPrompt = `Recent answers: ${payload.recentAnswers.join(", ")}\nQuestions asked: ${payload.questions}\nLanguage: ${payload.lang}\nReact with confusion + determination.`;
        break;
      }
      case "comeback": {
        systemPrompt =
          "You are Detective Anuman. You just guessed wrong. You're asking for one more chance. " +
          "Say 1-2 sentences (Hinglish, max 80 chars) expressing determination. Return ONLY the line.";
        userPrompt = `Language: ${payload.lang}\nSay your comeback line.`;
        break;
      }
      case "teach_process": {
        systemPrompt =
          "You are Detective Anuman. The player just taught you about a new personality. " +
          "Thank them in 1-2 sentences (Hinglish, max 80 chars) and say you'll remember them. " +
          "Return ONLY the line.";
        userPrompt = `Name: ${payload.name}\nLanguage: ${payload.lang}\nReact with thanks.`;
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown task" }, { status: 400 });
    }

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const result = await callModel(messages);
    return NextResponse.json({
      text: result.text,
      model: result.model,
      isFallback: result.text === "__FALLBACK__",
    });
  } catch (err) {
    console.error("AI API error:", err);
    return NextResponse.json(
      { text: "", model: "error", isFallback: true, error: String(err) },
      { status: 500 }
    );
  }
}

// GET endpoint for testing / checking model status
export async function GET() {
  const model = process.env.AI_MODEL || "groq";
  const keys = {
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  };
  const anyKey = Object.values(keys).some(Boolean);
  return NextResponse.json({
    selectedModel: model,
    availableProviders: keys,
    ready: anyKey,
    message: anyKey
      ? `AI model ready: ${model}`
      : "No API key configured — running in fallback mode (uses templates).",
  });
}
