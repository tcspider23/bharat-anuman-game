"use client";

import { useState } from "react";
import type { Lang } from "@/lib/translations";
import { t } from "@/lib/translations";
import {
  ACHIEVEMENTS,
  loadHistory,
  loadUnlockedAchievements,
  resetAll,
  type HistoryEntry,
} from "@/lib/store";
import { CATEGORY_IDS, getAllPersonalities, saveUserPersonality, type Category, type Personality, type UserPersonality } from "@/lib/knowledge";
import { TRACKS } from "@/lib/music";
import Modal from "./Modal";
import { useEffect, useMemo, useRef } from "react";

export function HelpContent({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-3 text-white/85">
      <Step n={1} lang={lang} k="howToPlay1" emoji="🎮" />
      <Step n={2} lang={lang} k="howToPlay2" emoji="💭" />
      <Step n={3} lang={lang} k="howToPlay3" emoji="🔘" />
      <Step n={4} lang={lang} k="howToPlay4" emoji="📈" />
      <Step n={5} lang={lang} k="howToPlay5" emoji="📚" />

      <div className="mt-4 ba-card rounded-xl p-4">
        <div className="font-bold mb-2">Answer buttons</div>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <AnswerButton color="bg-green-700" label={t(lang, "yes")} hint="Definitely yes" />
          <AnswerButton color="bg-emerald-700" label={t(lang, "probably")} hint="Probably yes" />
          <AnswerButton color="bg-purple-700" label={t(lang, "dontKnow")} hint="Unsure" />
          <AnswerButton color="bg-orange-800" label={t(lang, "probablyNot")} hint="Probably no" />
          <AnswerButton color="bg-red-700" label={t(lang, "no")} hint="Definitely no" />
        </div>
      </div>

      <div className="mt-4 ba-card rounded-xl p-4">
        <div className="font-bold mb-2">🕵️ Detective Reactions</div>
        <ul className="text-sm space-y-1 text-white/80">
          <li>✅ YES streak → He gets more confident</li>
          <li>✅ 3 YES in a row → Celebration spin!</li>
          <li>❌ NO streak → He gets confused</li>
          <li>❌ 3 NO in a row → He uses his brain 🧠</li>
        </ul>
      </div>
    </div>
  );
}

function Step({ n, lang, k, emoji }: { n: number; lang: Lang; k: string; emoji: string }) {
  return (
    <div className="flex gap-3 ba-card rounded-xl p-3">
      <div className="w-10 h-10 rounded-xl ba-primary flex items-center justify-center font-black">
        {n}
      </div>
      <div className="flex-1">
        <div className="font-bold">{t(lang, k)}</div>
      </div>
      <div className="text-2xl">{emoji}</div>
    </div>
  );
}

function AnswerButton({ color, label, hint }: { color: string; label: string; hint: string }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${color} flex items-center justify-between`}>
      <span className="font-bold text-sm">{label}</span>
      <span className="text-xs opacity-80">{hint}</span>
    </div>
  );
}

// ============ Settings Modal (full) ============
export function SettingsModalContent({
  lang,
  settings,
  onSettings,
}: {
  lang: Lang;
  settings: any;
  onSettings: (patch: any) => void;
}) {
  const LANGS_UI = [
    { id: "en", label: "English", flag: "🇬🇧" },
    { id: "hi", label: "हिंदी", flag: "🇮🇳" },
    { id: "hinglish", label: "Hinglish", flag: "🇮🇳" },
    { id: "ta", label: "தமிழ்", flag: "🇮🇳" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-2">{t(lang, "language")}</label>
        <div className="grid grid-cols-2 gap-2">
          {LANGS_UI.map((l) => (
            <button
              key={l.id}
              onClick={() => onSettings({ language: l.id })}
              className={`ba-chip rounded-xl p-3 text-left ${settings.language === l.id ? "ba-chip-active" : ""}`}
            >
              <span className="mr-2">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <ToggleRow label={t(lang, "voiceAssistant")} on={settings.voiceAssistant} onChange={(v) => onSettings({ voiceAssistant: v })} />
      <ToggleRow label={t(lang, "microphone")} on={settings.microphone} onChange={(v) => onSettings({ microphone: v })} />
      <ToggleRow label={t(lang, "music")} on={settings.music} onChange={(v) => onSettings({ music: v })} />
      {settings.music && (
        <div className="pl-4 space-y-3">
          <div>
            <label className="block text-xs text-white/60 mb-2">
              {t(lang, "volume")}: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.volume}
              onChange={(e) => onSettings({ volume: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-2">Track</label>
            <div className="grid grid-cols-2 gap-2">
              {TRACKS.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => onSettings({ currentTrack: tr.id })}
                  className={`ba-chip rounded-lg px-3 py-2 text-left text-xs ${
                    settings.currentTrack === tr.id ? "ba-chip-active" : ""
                  }`}
                >
                  <div className="font-bold truncate">🎵 {tr.name}</div>
                  <div className="text-[10px] text-white/60 capitalize">{tr.mood}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <ToggleRow label={t(lang, "soundEffects")} on={settings.soundEffects} onChange={(v) => onSettings({ soundEffects: v })} />
      <ToggleRow label={t(lang, "animations")} on={settings.animations} onChange={(v) => onSettings({ animations: v })} />
      <ToggleRow label={t(lang, "reducedMotion")} on={settings.reducedMotion} onChange={(v) => onSettings({ reducedMotion: v })} />
      <div className="pt-4">
        <button
          onClick={() => {
            if (confirm("Reset all history, stats and learned personalities?")) {
              resetAll();
              location.reload();
            }
          }}
          className="ba-btn w-full py-3 bg-red-600/80 text-white"
        >
          {t(lang, "resetHistory")}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold">{label}</span>
      <button
        onClick={() => onChange(!on)}
        className={`relative w-14 h-8 rounded-full transition ${on ? "bg-gradient-to-r from-orange-500 to-pink-500" : "bg-white/20"}`}
      >
        <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${on ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}

// ============ History Modal ============
export function CandidateDatabaseModal({ open, onClose, lang }: { open: boolean; onClose: () => void; lang: Lang }) {
  const [people, setPeople] = useState<Personality[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [profession, setProfession] = useState<string>("all");

  useEffect(() => {
    if (open) {
      setPeople(getAllPersonalities());
      setQuery("");
      setCategory("all");
      setProfession("all");
    }
  }, [open]);

  const professions = useMemo(() => {
    const set = new Set<string>();
    people.forEach((p) => set.add(p.profession.split(" / ")[0].trim()));
    return Array.from(set).sort();
  }, [people]);

  const filtered = people.filter((person) => {
    const matchesCategory = category === "all" || person.category === category;
    const baseProfession = person.profession.split(" / ")[0].trim();
    const matchesProfession = profession === "all" || baseProfession === profession;
    const haystack = `${person.name} ${person.profession} ${person.region ?? ""}`.toLowerCase();
    return matchesCategory && matchesProfession && haystack.includes(query.toLowerCase().trim());
  });

  return (
    <Modal open={open} onClose={onClose} title="Candidate Database" wide>
      <div className="space-y-4">
        <div className="candidate-db-intro">
          <div>
            <div className="font-black text-lg">🗃️ All Suspects Directory</div>
            <div className="text-xs text-white/65">Browse every personality profile available to Detective Anuman.</div>
          </div>
          <div className="candidate-db-count">{people.length} total</div>
        </div>

        <div className="candidate-db-controls">
          <label className="candidate-db-search">
            <span>🔎</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, profession or region..."
              aria-label="Search candidate database"
            />
          </label>
          <div className="candidate-db-filters">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as "all" | Category)}
              className="candidate-db-select"
              aria-label="Filter candidate category"
            >
              <option value="all">All categories</option>
              {CATEGORY_IDS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              className="candidate-db-select"
              aria-label="Filter candidate profession"
            >
              <option value="all">All professions</option>
              {professions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/55">
          <span>Showing {filtered.length} candidates</span>
          <span>Top-to-bottom investigation file</span>
        </div>

        {filtered.length === 0 ? (
          <div className="candidate-db-empty">No matching candidate found. Try another clue.</div>
        ) : (
          <div className="candidate-db-list">
            {filtered.map((person, index) => (
              <div
                key={person.id}
                className="candidate-db-row"
                style={{ animationDelay: `${Math.min(index, 18) * 35}ms` }}
              >
                <div className="candidate-db-avatar">{person.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate">{person.name}</div>
                  <div className="text-xs text-white/60 truncate">{person.profession} · {person.region ?? "India"}</div>
                </div>
                <div className="candidate-db-category">{person.category}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function HistoryModal({ open, onClose, lang }: { open: boolean; onClose: () => void; lang: Lang }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    setHistory(loadHistory());
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "historyTitle")}>
      {history.length === 0 ? (
        <div className="text-center py-10 text-white/60">
          <div className="text-5xl mb-3">📜</div>
          {t(lang, "emptyHistory")}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="ba-card rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-bold">{h.personalityName}</div>
                <div className="text-xs text-white/60">
                  {h.category} • {h.questions} Q • {new Date(h.date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-black ${h.result === "win" ? "text-green-400" : "text-red-400"}`}>
                  {h.result === "win" ? "✓" : "✗"}
                </div>
                <div className="text-xs text-white/60">{h.score} pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ============ Teach Predictor Modal ============
export function TeachModal({
  open,
  onClose,
  lang,
  suggestedCategory,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  suggestedCategory?: Category;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    profession: "",
    category: (suggestedCategory ?? "famousIndia") as Category,
    gender: "male" as "male" | "female",
    living: true,
    famousFor: "",
    achievements: "",
    organization: "",
    region: "",
  });

  useEffect(() => {
    if (open && suggestedCategory) {
      setForm((f) => ({ ...f, category: suggestedCategory }));
    }
  }, [open, suggestedCategory]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    const p: UserPersonality = {
      id: `user_${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      profession: form.profession.trim() || "Personality",
      gender: form.gender,
      living: form.living,
      era: "contemporary",
      emoji: "🌟",
      famousFor: form.famousFor.trim() || "Learned from game",
      achievements: form.achievements.split(",").map((s) => s.trim()).filter(Boolean),
      interestingFact: "Taught by a player of Bharat Anuman.",
      organization: form.organization.trim() || undefined,
      region: form.region.trim() || undefined,
      traits: buildTraits(form),
      isUser: true,
    };
    saveUserPersonality(p);
    onSaved();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "teachTitle")}>
      <div className="space-y-4">
        <p className="text-sm text-white/70">{t(lang, "teachIntro")}</p>
        <Field label={t(lang, "name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label={t(lang, "profession")} value={form.profession} onChange={(v) => setForm({ ...form, profession: v })} />
        <div>
          <label className="block text-xs font-bold text-white/80 mb-1">{t(lang, "category")}</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_IDS.map((c) => (
              <button
                key={c}
                onClick={() => setForm({ ...form, category: c })}
                className={`ba-chip rounded-lg p-2 text-xs ${form.category === c ? "ba-chip-active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setForm({ ...form, gender: "male" })}
            className={`flex-1 ba-chip rounded-lg p-2 ${form.gender === "male" ? "ba-chip-active" : ""}`}
          >
            👨 Male
          </button>
          <button
            onClick={() => setForm({ ...form, gender: "female" })}
            className={`flex-1 ba-chip rounded-lg p-2 ${form.gender === "female" ? "ba-chip-active" : ""}`}
          >
            👩 Female
          </button>
        </div>
        <Field label={t(lang, "famousFor")} value={form.famousFor} onChange={(v) => setForm({ ...form, famousFor: v })} />
        <Field label={t(lang, "achievements")} value={form.achievements} onChange={(v) => setForm({ ...form, achievements: v })} placeholder="Comma-separated" />
        <Field label={t(lang, "organization")} value={form.organization} onChange={(v) => setForm({ ...form, organization: v })} />
        <Field label="Region / State" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
        <button onClick={handleSave} disabled={!form.name.trim()} className="ba-btn ba-primary w-full py-3">
          💾 {t(lang, "save")}
        </button>
      </div>
    </Modal>
  );
}

function buildTraits(form: any): Record<string, boolean | string | number> {
  const traits: Record<string, boolean | string | number> = {
    bornDecade: 2000, // default contemporary
  };
  const cat = form.category as Category;
  if (cat === "cricket") traits.isBatsman = true;
  if (cat === "bollywood") {
    if (form.gender === "male") traits.isActor = true;
    else traits.isActress = true;
    traits.language = "hindi";
  }
  if (cat === "sports") traits.isSportsperson = true;
  if (cat === "music") traits.isSinger = true;
  if (cat === "business") {
    traits.isFounder = true;
    traits.isCEO = true;
  }
  if (cat === "entertainment") {
    traits.isYouTuber = true;
    traits.isCreator = true;
  }
  return traits;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-white/80 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:border-orange-400"
      />
    </div>
  );
}

// ============ Final Result Modal ============
export function FinalResultModal({
  open,
  onClose,
  lang,
  personality,
  correct,
  score,
  confidence,
  questions,
  onTeach,
  onTryAgain,
  onPlayAgain,
  onRematch,
  isComeback,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  personality: Personality | null;
  correct: boolean;
  score: number;
  confidence: number;
  questions: number;
  onTeach: () => void;
  onTryAgain: () => void;
  onPlayAgain: () => void;
  onRematch: () => void;
  isComeback: boolean;
}) {
  const [showProfile, setShowProfile] = useState(false);

  if (!personality) return null;

  return (
    <Modal open={open} onClose={onClose} title={correct ? t(lang, "resultRight") : t(lang, "resultWrong")}>
      {correct && <div className="text-center mb-4">{isComeback && <div className="text-xl ba-gradient-alt font-black mb-2">{t(lang, "comebackTitle")}</div>}</div>}
      <div className="ba-card rounded-2xl p-5 mb-4">
        <div className="text-center">
          <div className="text-6xl mb-2">{personality.emoji}</div>
          <div className="text-2xl font-black ba-gradient mb-1">{personality.name}</div>
          <div className="text-sm text-white/70 mb-3">{personality.profession}</div>
          <div className="inline-block ba-chip rounded-full px-3 py-1 text-xs mb-4">
            {personality.category}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <div className="text-xl font-black text-green-400">{score}</div>
              <div className="text-xs text-white/60">Score</div>
            </div>
            <div>
              <div className="text-xl font-black text-orange-400">{Math.round(confidence * 100)}%</div>
              <div className="text-xs text-white/60">{t(lang, "confidence")}</div>
            </div>
            <div>
              <div className="text-xl font-black text-pink-400">{questions}</div>
              <div className="text-xs text-white/60">{t(lang, "questionsAsked")}</div>
            </div>
          </div>
        </div>
        {correct && (
          <>
            <div className="ba-card rounded-xl p-3 mb-3">
              <div className="text-xs text-white/60 mb-1">{t(lang, "famousFor")}</div>
              <div className="font-semibold text-sm">{personality.famousFor}</div>
            </div>
            <div className="ba-card rounded-xl p-3 mb-3">
              <div className="text-xs text-white/60 mb-1">{t(lang, "interestingFact")}</div>
              <div className="font-semibold text-sm">{personality.interestingFact}</div>
            </div>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="text-xs text-orange-400 hover:underline mb-3"
            >
              {showProfile ? "Hide" : "Show"} full profile
            </button>
            {showProfile && (
              <div className="ba-card rounded-xl p-3 text-sm">
                <div className="font-bold mb-1">Achievements</div>
                <ul className="list-disc list-inside text-white/80">
                  {personality.achievements.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {correct ? (
          <>
            <button onClick={onPlayAgain} className="ba-btn ba-primary py-3">🎮 Play Again</button>
            <button onClick={onRematch} className="ba-btn ba-gold py-3">🔁 Rematch</button>
          </>
        ) : (
          <>
            <button onClick={onTeach} className="ba-btn ba-primary py-3">📚 {t(lang, "teach")}</button>
            <button onClick={onTryAgain} className="ba-btn ba-gold py-3">🔁 Try Again</button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ============ Confetti ============
export function Confetti() {
  const colors = ["#ff9933", "#f7c948", "#138808", "#e23e57", "#5b5494"];
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 60 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 2;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${left}%`,
              background: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

// ============ Microphone Indicator ============
export function MicIndicator({ listening }: { listening: boolean }) {
  if (!listening) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 ba-card rounded-full px-4 py-2 flex items-center gap-2">
      <div className="relative w-4 h-4">
        <div className="mic-ring" />
        <div className="w-full h-full bg-red-500 rounded-full" />
      </div>
      <span className="text-sm font-semibold">Listening...</span>
    </div>
  );
}

// ============ Daily Mystery ============
export function DailyMysteryModal({
  open,
  onClose,
  lang,
  onStart,
  personalityName,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  onStart: () => void;
  personalityName: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={t(lang, "dailyMystery")}>
      <div className="text-center py-4">
        <div className="text-6xl mb-4">🌟</div>
        <div className="text-xl font-black ba-gradient mb-2">{personalityName}</div>
        <p className="text-white/70 mb-4">{t(lang, "mysteryIntro")}</p>
        <button onClick={onStart} className="ba-btn ba-primary px-8 py-3">
          {t(lang, "startDaily")}
        </button>
      </div>
    </Modal>
  );
}

// ============ Achievement Toast ============
export function AchievementToast({
  achievementId,
  onClose,
}: {
  achievementId: string | null;
  onClose: () => void;
}) {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (achievementId) {
      ref.current = setTimeout(onClose, 4000);
    }
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [achievementId, onClose]);
  if (!achievementId) return null;
  const a = ACHIEVEMENTS.find((x) => x.id === achievementId);
  if (!a) return null;
  return (
    <div className="fixed top-4 right-4 z-50 ba-card rounded-2xl p-4 max-w-xs border-2 border-orange-400 animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{a.emoji}</div>
        <div>
          <div className="text-xs text-orange-400 font-bold">🏆 Achievement Unlocked!</div>
          <div className="font-black text-lg">{a.title}</div>
          <div className="text-xs text-white/70">{a.description}</div>
        </div>
      </div>
    </div>
  );
}
