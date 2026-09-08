"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DetectiveAnuman, { type Mood } from "@/components/DetectiveAnuman";
import { GAME_MODES } from "@/lib/knowledge";
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  loadSettings,
  loadStats,
  saveSettings,
  saveStats,
  type Settings,
} from "@/lib/store";
import { LANGS, t, type Lang } from "@/lib/translations";
import { primeAudio } from "@/lib/music";
import Modal from "@/components/Modal";
import { CandidateDatabaseModal, HelpContent, TeachModal } from "@/components/modals";

// Detective mood + dialogue loop for the home page
const HERO_SCENES: { mood: Mood; line: string }[] = [
  { mood: "neutral", line: "Kisi ko socho... main guess karunga! 🕵️" },
  { mood: "smile", line: "Hmm... interesting clue 😏" },
  { mood: "confident", line: "Case interesting ho raha hai! 👀" },
  { mood: "confused", line: "Hmmm... ye NO kya tha? 🤔" },
  { mood: "intense", line: "Ab dimaag lagana padega! 🧠" },
  { mood: "celebrate", line: "YES! Case solved! 😎" },
];

export default function HomePage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [selectedMode, setSelectedMode] = useState("mixed");
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [databaseOpen, setDatabaseOpen] = useState(false);
  const [teachOpen, setTeachOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [logoClicks, setLogoClicks] = useState(0);
  const [heroTick, setHeroTick] = useState(0);
  const [celebrateUntil, setCelebrateUntil] = useState(0);

  // Detective performs a small loop of expressions + dialogue on the home page
  useEffect(() => {
    if (settings.reducedMotion) return;
    const id = setInterval(() => setHeroTick((s) => s + 1), 3200);
    return () => clearInterval(id);
  }, [settings.reducedMotion]);

  const handleDetectiveClick = () => {
    setHeroTick((s) => s + 1);
    setCelebrateUntil(Date.now() + 1800);
  };

  useEffect(() => {
    if (!celebrateUntil) return;
    const id = setTimeout(() => setCelebrateUntil(0), celebrateUntil - Date.now());
    return () => clearTimeout(id);
  }, [celebrateUntil]);

  const celebrating = Date.now() < celebrateUntil;
  const heroMood: Mood = celebrating ? "celebrate" : HERO_SCENES[heroTick % HERO_SCENES.length].mood;
  const heroLine = celebrating
    ? "Main hoon na! Case mera hoga 🕵️"
    : HERO_SCENES[heroTick % HERO_SCENES.length].line;

  useEffect(() => {
    primeAudio();
    const s = loadSettings();
    setSettings(s);
    setLang(s.language);
    setStats(loadStats());
  }, []);

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    if (patch.language) setLang(patch.language);
  };

  const accuracy = stats.gamesPlayed > 0 ? Math.round((stats.correctGuesses / stats.gamesPlayed) * 100) : 0;

  const handleLogoClick = () => {
    setLogoClicks((c) => c + 1);
    setTimeout(() => setLogoClicks(0), 1000);
  };

  return (
    <div className="relative min-h-screen">
      <div className="ba-particles" />

      <main className="relative z-10 max-w-6xl mx-auto px-5 py-6 md:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 md:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl ba-primary flex items-center justify-center text-2xl shadow-lg">
              🕵️
            </div>
            <div>
              <div
                onClick={handleLogoClick}
                className="ba-title text-2xl md:text-3xl ba-gradient font-black cursor-pointer"
              >
                {t(lang, "brand")}
              </div>
              <div className="text-xs text-white/60">
                {logoClicks >= 2 && <span>🕵️ Detective Anuman winks at you!</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="ba-btn ba-card px-4 py-2 text-sm flex items-center gap-2"
            >
              ⚙️ <span className="hidden sm:inline">{t(lang, "settings")}</span>
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="grid md:grid-cols-[1.1fr_1fr] gap-8 items-center mb-12 md:mb-16">
          <div>
            <h1 className="ba-title text-4xl md:text-6xl font-black leading-tight mb-4">
              <span className="ba-gradient">{t(lang, "brand")}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6 leading-relaxed">
              {t(lang, "tagline")}
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href={`/game?mode=${encodeURIComponent(selectedMode)}`}
                className="ba-btn ba-primary ba-glow-amber px-8 py-4 text-lg"
              >
                🎮 {t(lang, "play")}
              </Link>
              <button
                onClick={() => setHelpOpen(true)}
                className="ba-btn ba-card px-6 py-4 text-lg flex items-center gap-2"
              >
                📖 {t(lang, "howToPlay")}
              </button>
              <button
                onClick={() => setDatabaseOpen(true)}
                className="ba-btn ba-card ba-glow-blue px-6 py-4 text-lg flex items-center gap-2"
              >
                🗃️ Database
              </button>
              <button
                onClick={() => setTeachOpen(true)}
                className="ba-btn ba-card ba-glow-green px-6 py-4 text-lg flex items-center gap-2"
              >
                📚 Teach Me
              </button>
              <a
                href="/presentation"
                target="_blank"
                className="ba-btn ba-gold ba-glow-gold px-6 py-4 text-lg flex items-center gap-2"
              >
                📊 View PPT
              </a>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-white/70">
              <span className="ba-card rounded-full px-3 py-1">🎯 {stats.gamesPlayed} games</span>
              <span className="ba-card rounded-full px-3 py-1">🏆 {accuracy}% accuracy</span>
              <span className="ba-card rounded-full px-3 py-1">🔥 {stats.currentStreak} streak</span>
              <span className="ba-card rounded-full px-3 py-1">🧠 Level {stats.level}</span>
            </div>
          </div>

          <div className="flex flex-col items-center relative">
            <div className="text-xs text-white/50 mb-1 select-none">👆 Tap the detective!</div>
            <DetectiveAnuman mood={heroMood} onClick={handleDetectiveClick} />
            <div key={heroTick} className="speech-bubble speech-bubble-pop -mt-2 max-w-[260px]">
              <span className="block text-xs font-black text-orange-500 mb-1">🕵️ DETECTIVE ANUMAN</span>
              <span className="text-sm font-semibold">{heroLine}</span>
            </div>
          </div>
        </section>

        {/* Mode Selection */}
        <section className="mb-12 md:mb-16">
          <h2 className="ba-title text-2xl md:text-3xl mb-4 ba-gradient-alt font-black">
            {t(lang, "chooseMode")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GAME_MODES.map((m) => (
              <Link
                key={m.id}
                href={`/game?mode=${encodeURIComponent(m.id)}`}
                onClick={() => setSelectedMode(m.id)}
                className={`ba-chip rounded-2xl p-4 transition ${selectedMode === m.id ? "ba-chip-active" : ""}`}
              >
                <div className="text-3xl mb-2">{m.emoji}</div>
                <div className="font-bold text-sm md:text-base">{m.label}</div>
                <div className="text-xs text-white/60 mt-1 leading-snug">{m.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-12 md:mb-16">
          <h2 className="ba-title text-2xl md:text-3xl mb-6 ba-gradient font-black">
            {t(lang, "features")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: "🧠", title: "Adaptive AI", desc: "Real probability-based questioning, not random." },
              { emoji: "🕵️", title: "Detective Anuman", desc: "Watch him react to every clue you give." },
              { emoji: "🌍", title: "4 Languages", desc: "English, Hindi, Hinglish, Tamil." },
              { emoji: "🏏", title: "11 Game Modes", desc: "From Cricket to Challenge to Surprise Me." },
              { emoji: "📚", title: "Teach Me", desc: "I got it wrong? Teach me the right answer!" },
              { emoji: "🏆", title: "Achievements", desc: "Unlock achievements as you play." },
            ].map((f) => (
              <div key={f.title} className="ba-card rounded-2xl p-5">
                <div className="text-3xl mb-2">{f.emoji}</div>
                <div className="font-bold text-lg mb-1">{f.title}</div>
                <div className="text-sm text-white/70 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <h2 className="ba-title text-2xl md:text-3xl mb-6 ba-gradient-alt font-black">
            {t(lang, "stats")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: t(lang, "gamesPlayed"), value: stats.gamesPlayed, emoji: "🎮" },
              { label: t(lang, "accuracy"), value: `${accuracy}%`, emoji: "🎯" },
              { label: t(lang, "streak"), value: `${stats.currentStreak} / ${stats.bestStreak}`, emoji: "🔥" },
              { label: t(lang, "learned"), value: stats.personalitiesLearned, emoji: "📚" },
            ].map((s) => (
              <div key={s.label} className="ba-card rounded-2xl p-5 text-center">
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-2xl md:text-3xl font-black ba-gradient">{s.value}</div>
                <div className="text-xs text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-white/50 py-6 border-t border-white/10">
          <span>{t(lang, "footer")}</span>
        </footer>
      </main>

      {/* Modals */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={t(lang, "howToPlayTitle")}>
        <HelpContent lang={lang} />
      </Modal>

      <CandidateDatabaseModal
        open={databaseOpen}
        onClose={() => setDatabaseOpen(false)}
        lang={lang}
      />

      <TeachModal
        open={teachOpen}
        onClose={() => setTeachOpen(false)}
        lang={lang}
        onSaved={() => {
          const newStats = { ...stats, personalitiesLearned: stats.personalitiesLearned + 1 };
          setStats(newStats);
          saveStats(newStats);
        }}
      />

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t(lang, "settingsTitle")}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">{t(lang, "language")}</label>
            <div className="grid grid-cols-2 gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => updateSettings({ language: l.id })}
                  className={`ba-chip rounded-xl p-3 text-left ${settings.language === l.id ? "ba-chip-active" : ""}`}
                >
                  <span className="mr-2">{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <ToggleRow label={t(lang, "voiceAssistant")} on={settings.voiceAssistant} onChange={(v) => updateSettings({ voiceAssistant: v })} />
          <ToggleRow label={t(lang, "microphone")} on={settings.microphone} onChange={(v) => updateSettings({ microphone: v })} />
          <ToggleRow label={t(lang, "music")} on={settings.music} onChange={(v) => updateSettings({ music: v })} />
          {settings.music && (
            <div className="pl-4">
              <label className="block text-xs text-white/60 mb-2">{t(lang, "volume")}: {Math.round(settings.volume * 100)}%</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
          <ToggleRow label={t(lang, "soundEffects")} on={settings.soundEffects} onChange={(v) => updateSettings({ soundEffects: v })} />
          <ToggleRow label={t(lang, "animations")} on={settings.animations} onChange={(v) => updateSettings({ animations: v })} />
          <ToggleRow label={t(lang, "reducedMotion")} on={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
        </div>
      </Modal>
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
