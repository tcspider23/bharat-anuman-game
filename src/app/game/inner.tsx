"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetectiveAnuman, { type Mood } from "@/components/DetectiveAnuman";
import {
  applyAnswer,
  createInitialState,
  detectContradiction,
  explainQuestion,
  excludeCandidate,
  getFinalGuess,
  getTopCandidates,
  giveHint,
  pickBestQuestion,
  shouldGuess,
  type GameState,
} from "@/lib/engine";
import { GAME_MODES, type Personality } from "@/lib/knowledge";
import { QUESTIONS, type Answer } from "@/lib/questions";
import { t, type Lang } from "@/lib/translations";
import {
  addHistoryEntry,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  loadSettings,
  loadStats,
  saveSettings,
  saveStats,
  unlockAchievement,
  type Settings,
  type Stats,
} from "@/lib/store";
import {
  TRACKS,
  startMusic,
  stopMusic,
  setVolume as setMusicVolume,
  playSoundEffect,
  primeAudio,
} from "@/lib/music";
import { askAI, getModelStatus } from "@/lib/aiClient";
import Modal from "@/components/Modal";
import {
  AchievementToast,
  CandidateDatabaseModal,
  Confetti,
  FinalResultModal,
  HelpContent,
  HistoryModal,
  SettingsModalContent,
  TeachModal,
} from "@/components/modals";

type Phase = "playing" | "guess" | "result" | "comeback";

export default function GameInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "mixed";
  const modeInfo = GAME_MODES.find((m) => m.id === mode) ?? GAME_MODES[GAME_MODES.length - 1];

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
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

  const [gameState, setGameState] = useState<GameState>(() => createInitialState(mode));
  const [phase, setPhase] = useState<Phase>("playing");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("neutral");
  const [detectiveDialogue, setDetectiveDialogue] = useState("");
  const [hintText, setHintText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [finalPersonality, setFinalPersonality] = useState<Personality | null>(null);
  const [guessCorrect, setGuessCorrect] = useState(false);
  const [isComeback, setIsComeback] = useState(false);
  const [unlockedAch, setUnlockedAch] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [reconsidering, setReconsidering] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [databaseOpen, setDatabaseOpen] = useState(false);
  const [teachOpen, setTeachOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [dialoguePop, setDialoguePop] = useState(0);

  const recognitionRef = useRef<any>(null);
  const comebackQuestionsRef = useRef(0);
  const [modelInfo, setModelInfo] = useState<{ model: string; ready: boolean } | null>(null);

  // Check AI model status on load
  useEffect(() => {
    getModelStatus().then((info) => {
      setModelInfo({ model: info.selectedModel, ready: info.ready });
    });
  }, []);

  // ================= UNIFIED GAME STEP =================
  // Single source of truth for "it's our turn": decides whether to GUESS or
  // ASK the next question. Depends on the whole gameState so it reliably
  // re-runs after answers, exclusions (comeback) and phase changes — this
  // prevents the game from ever getting stuck on "Preparing next question...".
  useEffect(() => {
    if (phase !== "playing") return;
    if (currentQuestionId) return; // a question is already showing

    // Guess? (only after a minimum of questions, or when nothing else to ask)
    const canGuess = gameState.questionCount >= 3 && shouldGuess(gameState);
    if (canGuess) {
      const p = getFinalGuess(gameState);
      if (p) {
        setFinalPersonality(p);
        setPhase("guess");
        setDetectiveDialogue(`I think I've got it! 🕵️`);
        speak(`I think I know who it is`);
        return;
      }
    }

    // Otherwise, ask the next best question.
    const q = pickBestQuestion(gameState);
    if (q) {
      setCurrentQuestionId(q.id);
      if (gameState.questionCount === 0) {
        setDetectiveDialogue(getOpeningLine(mode, lang));
      }
      return;
    }

    // Safety net: no useful question left — commit to a guess so the game
    // never stalls (e.g. right after a rejected guess with a tiny pool).
    if (gameState.questionCount >= 3) {
      const p = getFinalGuess(gameState);
      if (p) {
        setFinalPersonality(p);
        setPhase("guess");
        setDetectiveDialogue(`I think I've got it! 🕵️`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, gameState, currentQuestionId]);

  // Reconsider after 3 NOs
  useEffect(() => {
    if (gameState.noStreak >= 3 && gameState.noStreak !== 0) {
      setReconsidering(true);
      const timer = setTimeout(() => setReconsidering(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.noStreak]);

  // Prime audio (unlock on first user gesture, per browser autoplay policy)
  useEffect(() => {
    primeAudio();
  }, []);

  // Music play/stop — restart only on track or play-state change
  useEffect(() => {
    if (settings.music && phase === "playing") {
      startMusic(settings.currentTrack, settings.volume);
    } else {
      stopMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.music, settings.currentTrack, phase]);

  // Volume changes apply live without restarting the track
  useEffect(() => {
    setMusicVolume(settings.volume);
  }, [settings.volume]);

  const cycleTrack = (dir: number) => {
    const next =
      (settings.currentTrack + dir + TRACKS.length) % TRACKS.length;
    updateSettings({ currentTrack: next });
  };

  const speak = (text: string) => {
    if (!settings.voiceAssistant) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ta" ? "ta-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    u.rate = 1.0;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (!settings.microphone) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = lang === "ta" ? "ta-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    r.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript.toLowerCase().trim();
      const ans = parseVoiceAnswer(transcript);
      if (ans) {
        handleAnswer(ans);
      } else if (transcript.includes("hint")) {
        handleHint();
      } else if (transcript.includes("skip")) {
        handleSkip();
      }
      setListening(false);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.microphone, lang]);

  const startListening = () => {
    if (!recognitionRef.current || !settings.microphone) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const parseVoiceAnswer = (s: string): Answer | null => {
    const n = s.toLowerCase().trim();
    if (/^(yes|haan|ha|aad)$/.test(n)) return "yes";
    if (/^(no|nahi|na|nope|illa)$/.test(n)) return "no";
    if (/^(probably\s*yes|shayad\s*haan|probably)$/.test(n)) return "probablyYes";
    if (/^(probably\s*not|shayad\s*nahi|probably\s*no)$/.test(n)) return "probablyNo";
    if (/^(don'?t\s*know|dunno|pata\s*nahi|theriyala)$/.test(n)) return "dontKnow";
    return null;
  };

  const currentQuestion = useMemo(
    () => QUESTIONS.find((q) => q.id === currentQuestionId) ?? null,
    [currentQuestionId]
  );

  const topCandidates = useMemo(() => getTopCandidates(gameState, 5), [gameState]);
  const confidence = gameState.confidence;

  // Detective mood based on streak after each answer — uses AI model for dialogue
  useEffect(() => {
    if (phase !== "playing") return;
    const lastAns = gameState.askedQuestions[gameState.askedQuestions.length - 1]?.answer;
    if (!lastAns) return;

    const lastQ = gameState.askedQuestions[gameState.askedQuestions.length - 1]?.question;
    const lastQText = lastQ?.text[lang] ?? "";

    if (lastAns === "yes" || lastAns === "probablyYes") {
      if (gameState.yesStreak === 1) {
        setMood("smile");
        askAI("detective_reaction", { streak: 1, answer: "yes", question: lastQText, lang }).then((r) => {
          if (!r.isFallback) setDetectiveDialogue(r.text);
          else setDetectiveDialogue("Hmm... interesting 😏");
        });
      } else if (gameState.yesStreak === 2) {
        setMood("confident");
        askAI("detective_reaction", { streak: 2, answer: "yes", question: lastQText, lang }).then((r) => {
          if (!r.isFallback) setDetectiveDialogue(r.text);
          else setDetectiveDialogue("Accha! Ab clues connect ho rahe hain 👀");
        });
      } else if (gameState.yesStreak >= 3) {
        setMood("clap");
        askAI("detective_reaction", { streak: 3, answer: "yes", question: lastQText, lang }).then((r) => {
          if (!r.isFallback) setDetectiveDialogue(r.text);
          else setDetectiveDialogue("YES! Ab toh case interesting ho gaya! 😎");
        });
        setTimeout(() => setMood("spin"), 1000);
        setTimeout(() => setMood("neutral"), 2400);
      }
    } else if (lastAns === "no" || lastAns === "probablyNo") {
      if (gameState.noStreak === 1) {
        setMood("confused");
        askAI("detective_reaction", { streak: 1, answer: "no", question: lastQText, lang }).then((r) => {
          if (!r.isFallback) setDetectiveDialogue(r.text);
          else setDetectiveDialogue("Hmmm... NO? 🤔 Accha... ye clue toh alag nikla.");
        });
      } else if (gameState.noStreak === 2) {
        setMood("moreConfused");
        askAI("detective_reaction", { streak: 2, answer: "no", question: lastQText, lang }).then((r) => {
          if (!r.isFallback) setDetectiveDialogue(r.text);
          else setDetectiveDialogue("Okay... ye case thoda tricky ho raha hai 👀");
        });
      } else if (gameState.noStreak >= 3) {
        setMood("intense");
        askAI("reconsider", {
          recentAnswers: gameState.askedQuestions.slice(-5).map((q) => q.answer),
          questions: gameState.questionCount,
          lang,
        }).then((r) => {
          if (!r.isFallback) setDetectiveDialogue(r.text);
          else setDetectiveDialogue("BHAI... TEEN NO?! 😳 Ab dimaag lagana padega! 🧠");
        });
      }
    } else {
      setMood("neutral");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.askedQuestions.length]);

  const handleAnswer = (answer: Answer) => {
    if (!currentQuestion || phase !== "playing") return;
    if (settings.soundEffects) {
      if (answer === "yes" || answer === "probablyYes") playSoundEffect("yes");
      else if (answer === "no" || answer === "probablyNo") playSoundEffect("no");
      else playSoundEffect("click");
    }

    const hadContradiction = detectContradiction(gameState);
    const newState = applyAnswer(gameState, currentQuestion.id, answer);
    setGameState(newState);

    if (hadContradiction) {
      setDetectiveDialogue(t(lang, "contradiction"));
    }

    if (newState.noStreak >= 3) {
      setReconsidering(true);
      setCurrentQuestionId(null);
      setTimeout(() => setReconsidering(false), 2000);
    } else {
      setTimeout(() => setCurrentQuestionId(null), 300);
    }
  };

  const handleHint = () => {
    const templateHint = giveHint(gameState);
    setHintText("Thinking... 🤔");
    setGameState({ ...gameState, score: Math.max(0, gameState.score - 100) });
    if (settings.soundEffects) playSoundEffect("click");

    // Try AI model for a better hint, fall back to template
    const topCandidate = getTopCandidates(gameState, 1)[0];
    if (topCandidate) {
      askAI("hint", { personality: topCandidate.personality, lang })
        .then((r) => {
          if (!r.isFallback && r.text) setHintText(r.text);
          else setHintText(templateHint);
        })
        .catch(() => setHintText(templateHint));
    } else {
      setHintText(templateHint);
    }
    speak(templateHint);
  };

  const handleSkip = () => {
    setCurrentQuestionId(null);
  };

  const handleConfirm = () => {
    setGuessCorrect(true);
    setMood("celebrate");
    setShowConfetti(true);
    setDetectiveDialogue("YES! Main jaanta tha! 🎉");
    speak("I knew it!");
    if (settings.soundEffects) playSoundEffect("win");
    finalizeGame(true);
    setTimeout(() => setShowConfetti(false), 4000);
    setTimeout(() => {
      setPhase("result");
    }, 1500);
  };

  const handleDeny = () => {
    if (!isComeback && gameState.questionCount < 22) {
      setIsComeback(true);
      setPhase("comeback");
      setMood("determined");
      setDetectiveDialogue("Arre nahi? 🤔 Wait... mujhe ek aur chance do! 😤");
      speak("Not that one? Wait, give me one more chance!");
      comebackQuestionsRef.current = 0;
      // CRITICAL FIX: remove the wrongly-guessed personality from the pool so
      // the AI never predicts the same person again.
      if (finalPersonality) {
        const wrongId = finalPersonality.id;
        setGameState((prev) => excludeCandidate(prev, wrongId));
      }
      setTimeout(() => {
        setPhase("playing");
        setCurrentQuestionId(null);
      }, 1500);
    } else {
      setGuessCorrect(false);
      setMood("determined");
      setDetectiveDialogue("Hmm... you got me this time. 😔");
      // Also exclude on the final wrong so any rematch starts cleaner
      if (finalPersonality) {
        const wrongId = finalPersonality.id;
        setGameState((prev) => excludeCandidate(prev, wrongId));
      }
      finalizeGame(false);
      setTimeout(() => setPhase("result"), 500);
    }
  };

  const finalizeGame = (correct: boolean) => {
    const finalState = gameState;
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    newStats.totalQuestions += finalState.questionCount;
    const cat = gameState.realCategory || "mixed";
    newStats.categoryMastery[cat] = {
      played: (newStats.categoryMastery[cat]?.played ?? 0) + 1,
      won: (newStats.categoryMastery[cat]?.won ?? 0) + (correct ? 1 : 0),
    };
    if (correct) {
      newStats.correctGuesses += 1;
      newStats.totalScore += finalState.score;
      newStats.bestScore = Math.max(newStats.bestScore, finalState.score);
      newStats.currentStreak += 1;
      newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
      newStats.xp += Math.round(finalState.score / 10);
      newStats.level = Math.floor(newStats.xp / 500) + 1;
    } else {
      newStats.currentStreak = 0;
    }
    setStats(newStats);
    saveStats(newStats);

    addHistoryEntry({
      personalityName: finalPersonality?.name ?? "Unknown",
      category: finalPersonality?.category ?? "unknown",
      questions: finalState.questionCount,
      confidence: finalState.confidence,
      score: finalState.score,
      result: correct ? "win" : "loss",
      date: new Date().toISOString(),
    });

    if (correct) {
      tryUnlock("firstGuess");
      if (finalState.questionCount < 10) tryUnlock("under10");
      if (finalState.confidence > 0.9) tryUnlock("perfect");
      if (finalState.yesStreak >= 3 || finalState.askedQuestions.slice(-3).every((q) => q.answer === "yes" || q.answer === "probablyYes")) {
        tryUnlock("threeYesCelebration");
      }
      if (isComeback) tryUnlock("comebackKing");
      if (cat === "cricket" && (newStats.categoryMastery.cricket?.won ?? 0) >= 5) tryUnlock("cricketMaster");
      if (cat === "bollywood" && (newStats.categoryMastery.bollywood?.won ?? 0) >= 5) tryUnlock("bollywoodExpert");
      if (cat === "sports" && (newStats.categoryMastery.sports?.won ?? 0) >= 5) tryUnlock("sportsMaster");
      if (cat === "music" && (newStats.categoryMastery.music?.won ?? 0) >= 5) tryUnlock("musicMaster");
      if (cat === "business" && (newStats.categoryMastery.business?.won ?? 0) >= 5) tryUnlock("businessMaster");
      if (mode === "challenge") tryUnlock("impossibleGuess");
    } else {
      if (finalState.noStreak >= 3 || finalState.askedQuestions.slice(-3).some((q) => q.answer === "no")) {
        tryUnlock("threeNoSurvivor");
      }
    }
  };

  const tryUnlock = (id: string) => {
    if (unlockAchievement(id as any)) {
      setUnlockedAch(id);
    }
  };

  const handleQuit = () => {
    router.push("/");
  };

  const handlePlayAgain = () => {
    setGameState(createInitialState(mode));
    setPhase("playing");
    setCurrentQuestionId(null);
    setFinalPersonality(null);
    setGuessCorrect(false);
    setIsComeback(false);
    setShowConfetti(false);
    setMood("neutral");
    setDetectiveDialogue(getOpeningLine(mode, lang));
    setHintText("");
    setReconsidering(false);
  };

  const handleLogoClick = () => {
    setLogoClicks((c) => c + 1);
    const lines = [
      "Kya tum tayyar ho? 🕵️",
      "Ab main tumhe confuse karunga!",
      "Chal, ek case solve karte hain!",
      "Mere paas har clue ka jawab hai.",
      "Hahaha, mujhe harana mushkil hai!",
    ];
    setDetectiveDialogue(lines[Math.floor(Math.random() * lines.length)]);
    setMood("confident");
    setTimeout(() => setMood("neutral"), 1200);
  };

  const handleDetectiveClick = () => {
    setDialoguePop((value) => value + 1);
    const lines = [
      "Case shuru karein? 🕵️",
      "Kisi ko socho, clues main dhoond lunga!",
      "Dekhte hain tum mujhe confuse kar paate ho ya nahi!",
      "Hmm... ek clue mil gaya 👀",
      "Ruko, investigation karne do.",
      "Case interesting ho raha hai!",
      "Ye clue important hai.",
      "Ab picture clear ho rahi hai!",
    ];
    setDetectiveDialogue(lines[Math.floor(Math.random() * lines.length)]);
    setMood("confident");
    setTimeout(() => setMood("neutral"), 1200);
  };

  const questionText = currentQuestion ? currentQuestion.text[lang] : "";
  const maxQuestions = mode === "rapid" ? 12 : mode === "challenge" ? 15 : 18;

  // Close-call detection: are the top 2 suspects too close to be sure?
  const topTwo = getTopCandidates(gameState, 2);
  const isCloseCall =
    topTwo.length === 2 &&
    topTwo[0].prob >= 0.3 &&
    topTwo[0].prob - topTwo[1].prob < 0.18;

  return (
    <div className="relative min-h-screen">
      <div className="ba-particles" />

      {showConfetti && <Confetti />}

      <div className="relative z-10 max-w-7xl mx-auto px-3 md:px-5 py-4">
        {/* Top Bar */}
        <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div
            onClick={handleLogoClick}
            className="ba-title text-xl md:text-2xl ba-gradient font-black cursor-pointer select-none"
          >
            {t(lang, "brand")}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="ba-card rounded-full px-3 py-1 text-xs">
              {modeInfo.emoji} {modeInfo.label}
            </div>
            {modelInfo && (
              <div
                className="ba-card rounded-full px-3 py-1 text-xs flex items-center gap-1"
                title={`AI Model: ${modelInfo.model}`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    modelInfo.ready ? "bg-green-400 animate-pulse" : "bg-yellow-400"
                  }`}
                />
                <span>{modelInfo.ready ? `🧠 ${modelInfo.model}` : "📋 Templates"}</span>
              </div>
            )}
            <button onClick={() => setHelpOpen(true)} className="ba-btn ba-card px-3 py-1 text-xs">📖 Help</button>
            <button onClick={() => setDatabaseOpen(true)} className="ba-btn ba-card px-3 py-1 text-xs">🗃️ Database</button>
            <button onClick={() => setSettingsOpen(true)} className="ba-btn ba-card px-3 py-1 text-xs">⚙️ Settings</button>
            <button onClick={() => setHistoryOpen(true)} className="ba-btn ba-card px-3 py-1 text-xs">📜 History</button>
            <button onClick={handleQuit} className="ba-btn ba-card px-3 py-1 text-xs">✕ Exit</button>
          </div>
        </header>

        {/* Stats bar */}
        <div className="ba-card rounded-2xl p-3 mb-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-sm">
          <div>
            <div className="text-xs text-white/60">{t(lang, "question")}</div>
            <div className="font-black">{gameState.questionCount + 1} / {maxQuestions}</div>
          </div>
          <div>
            <div className="text-xs text-white/60">{t(lang, "score")}</div>
            <div className="font-black ba-gradient">{gameState.score}</div>
          </div>
          <div>
            <div className="text-xs text-white/60">{t(lang, "confidence")}</div>
            <div className="font-black text-orange-400">{Math.round(confidence * 100)}%</div>
          </div>
          <div>
            <div className="text-xs text-white/60">{t(lang, "candidatesLeft")}</div>
            <div className="font-black">{gameState.candidates.length}</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-xs text-white/60 mb-1">Progress</div>
            <div className="ba-progress">
              <div className="ba-progress-bar" style={{ width: `${Math.min(100, (gameState.questionCount / maxQuestions) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-[1fr_1.2fr_1fr] gap-4">
          {/* Left: Detective */}
          <div className="flex flex-col items-center">
            <DetectiveAnuman mood={mood} onClick={handleDetectiveClick} />
            <div key={dialoguePop} className="speech-bubble speech-bubble-pop mt-3 w-full max-w-md">
              {reconsidering ? (
                <div className="italic">{t(lang, "reconsidering")}</div>
              ) : detectiveDialogue ? (
                <div>{detectiveDialogue}</div>
              ) : (
                <div className="italic text-slate-500">Thinking...</div>
              )}
            </div>
          </div>

          {/* Middle: Question + Answers */}
          <div className="flex flex-col gap-4">
            <div className="ba-card rounded-2xl p-5 min-h-[180px] flex flex-col justify-center">
              {currentQuestion ? (
                <>
                  <div className="text-xs text-orange-400 font-bold mb-2">
                    {t(lang, "question")} {gameState.questionCount + 1}
                  </div>
                  <div className="text-lg md:text-xl font-bold leading-relaxed mb-4">
                    {questionText}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        if (currentQuestion) {
                          const templateReason = explainQuestion(currentQuestion, gameState);
                          setDetectiveDialogue("Let me think about this... 🤔");
                          const topCands = getTopCandidates(gameState, 3).map((c) => ({
                            name: c.personality.name,
                            profession: c.personality.profession,
                          }));
                          askAI("why_this_question", {
                            question: currentQuestion.text[lang],
                            topCandidates: topCands,
                          })
                            .then((r) => {
                              if (!r.isFallback && r.text) setDetectiveDialogue(r.text);
                              else setDetectiveDialogue(templateReason);
                            })
                            .catch(() => setDetectiveDialogue(templateReason));
                        }
                      }}
                      className="ba-chip rounded-lg px-3 py-1 text-xs"
                    >
                      {t(lang, "whyQ")}
                    </button>
                    <button
                      onClick={handleHint}
                      className="ba-chip rounded-lg px-3 py-1 text-xs"
                    >
                      💡 {t(lang, "hint")}
                    </button>
                    <button
                      onClick={handleSkip}
                      className="ba-chip rounded-lg px-3 py-1 text-xs"
                    >
                      ⏭ {t(lang, "skip")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-white/60">
                  {reconsidering ? t(lang, "reconsidering") : "Preparing next question..."}
                </div>
              )}
            </div>

            <div className="answer-grid">
              <button onClick={() => handleAnswer("yes")} className="ba-answer ba-answer-yes" disabled={!currentQuestion || phase !== "playing"}>
                <span className="answer-icon">✓</span><span>{t(lang, "yes")}</span>
              </button>
              <button onClick={() => handleAnswer("probablyYes")} className="ba-answer ba-answer-prob-yes" disabled={!currentQuestion || phase !== "playing"}>
                <span className="answer-icon">＋</span><span>{t(lang, "probably")}</span>
              </button>
              <button onClick={() => handleAnswer("dontKnow")} className="ba-answer ba-answer-dk" disabled={!currentQuestion || phase !== "playing"}>
                <span className="answer-icon">?</span><span>{t(lang, "dontKnow")}</span>
              </button>
              <button onClick={() => handleAnswer("probablyNo")} className="ba-answer ba-answer-prob-no" disabled={!currentQuestion || phase !== "playing"}>
                <span className="answer-icon">−</span><span>{t(lang, "probablyNot")}</span>
              </button>
              <button onClick={() => handleAnswer("no")} className="ba-answer ba-answer-no" disabled={!currentQuestion || phase !== "playing"}>
                <span className="answer-icon">×</span><span>{t(lang, "no")}</span>
              </button>
            </div>

            {settings.microphone && (
              <button
                onClick={() => listening ? recognitionRef.current?.stop() : startListening()}
                className={`ba-btn ${listening ? "ba-primary" : "ba-card"} rounded-xl px-4 py-3 flex items-center justify-center gap-2 self-center relative`}
              >
                {listening && <div className="mic-ring" />}
                {listening ? "🎤 Listening..." : "🎤 Voice"}
              </button>
            )}

            {hintText && (
              <div className="ba-card rounded-xl p-3 text-sm">
                <span className="text-orange-400 font-bold">💡 Hint: </span>
                <span>{hintText}</span>
              </div>
            )}
          </div>

          {/* Right: Live AI Panel */}
          <div className="ba-card rounded-2xl p-4">
            <h3 className="font-black mb-3 ba-gradient">{t(lang, "topCandidates")}</h3>
            <div className="space-y-3">
              {topCandidates.map(({ personality, prob }) => (
                <div key={personality.id} className="ba-card rounded-xl p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-9 h-9 rounded-full ba-primary flex items-center justify-center text-lg flex-shrink-0">
                      {personality.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{personality.name}</div>
                      <div className="text-xs text-white/60 truncate">
                        {personality.profession}
                        {personality.region ? ` · ${personality.region}` : ""}
                      </div>
                    </div>
                    <div className="text-xs font-black text-orange-400 flex-shrink-0">{Math.round(prob * 100)}%</div>
                  </div>
                  <div className="candidate-bar mb-1.5">
                    <div className="candidate-fill" style={{ width: `${prob * 100}%` }} />
                  </div>
                  <div className="text-[10px] text-white/50 leading-snug line-clamp-2">
                    <span className="text-orange-400/80">📌 </span>
                    {personality.famousFor}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">{t(lang, "currentCategory")}</span>
                <span className="font-bold">{gameState.realCategory ?? "mixed"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">{t(lang, "questionsAsked")}</span>
                <span className="font-bold">{gameState.questionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">YES streak</span>
                <span className="font-bold text-green-400">{gameState.yesStreak}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">NO streak</span>
                <span className="font-bold text-red-400">{gameState.noStreak}</span>
              </div>
            </div>
            {gameState.recentAnswers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-xs text-white/60 mb-1">{t(lang, "recentAnswers")}</div>
                <div className="flex gap-1">
                  {gameState.recentAnswers.map((a, i) => (
                    <div
                      key={i}
                      className={`text-xs rounded px-2 py-1 font-bold ${
                        a === "yes" ? "bg-green-700" :
                        a === "probablyYes" ? "bg-emerald-700" :
                        a === "no" ? "bg-red-700" :
                        a === "probablyNo" ? "bg-orange-700" :
                        "bg-purple-700"
                      }`}
                    >
                      {a === "yes" ? "Y" : a === "no" ? "N" : a === "probablyYes" ? "P+" : a === "probablyNo" ? "P-" : "?"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/50">
          {t(lang, "footer")}
        </div>
      </div>

      {/* Floating music control widget */}
      <div className="ba-card fixed bottom-3 left-3 z-30 flex items-center gap-2 rounded-2xl px-3 py-2">
        <button
          onClick={() => updateSettings({ music: !settings.music })}
          className="ba-btn ba-primary h-9 w-9 rounded-xl text-base"
          aria-label={settings.music ? "Pause music" : "Play music"}
        >
          {settings.music ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => cycleTrack(-1)}
          disabled={!settings.music}
          className="ba-btn ba-card h-9 w-9 rounded-xl text-sm"
          aria-label="Previous track"
        >
          ⏮
        </button>
        <div className="min-w-[92px] max-w-[130px] text-left">
          <div className="truncate text-[11px] font-bold leading-tight">
            🎵 {settings.music ? TRACKS[settings.currentTrack].name : "Off"}
          </div>
          <div className="text-[10px] text-white/50 capitalize leading-tight">
            {settings.music ? TRACKS[settings.currentTrack].mood : "tap ▶ to play"}
          </div>
        </div>
        <button
          onClick={() => cycleTrack(1)}
          disabled={!settings.music}
          className="ba-btn ba-card h-9 w-9 rounded-xl text-sm"
          aria-label="Next track"
        >
          ⏭
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.volume}
          onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
          className="h-1 w-16 accent-orange-400"
          aria-label="Music volume"
        />
      </div>

      {/* Modals */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={t(lang, "howToPlayTitle")}>
        <HelpContent lang={lang} />
      </Modal>
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t(lang, "settingsTitle")}>
        <SettingsModalContent lang={lang} settings={settings} onSettings={updateSettings} />
      </Modal>
      <HistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} lang={lang} />
      <CandidateDatabaseModal open={databaseOpen} onClose={() => setDatabaseOpen(false)} lang={lang} />
      <TeachModal
        open={teachOpen}
        onClose={() => setTeachOpen(false)}
        lang={lang}
        suggestedCategory={gameState.realCategory ?? "famousIndia"}
        onSaved={() => {
          const newStats = { ...stats, personalitiesLearned: stats.personalitiesLearned + 1 };
          setStats(newStats);
          saveStats(newStats);
          if (newStats.personalitiesLearned >= 5) tryUnlock("knowledgeBuilder");
        }}
      />
      <FinalResultModal
        open={phase === "result" && !!finalPersonality}
        onClose={() => handlePlayAgain()}
        lang={lang}
        personality={finalPersonality}
        correct={guessCorrect}
        score={gameState.score}
        confidence={gameState.confidence}
        questions={gameState.questionCount}
        onTeach={() => setTeachOpen(true)}
        onTryAgain={handlePlayAgain}
        onPlayAgain={handlePlayAgain}
        onRematch={handlePlayAgain}
        isComeback={isComeback}
      />
      {/* Confirm/deny overlay when guessing */}
      {phase === "guess" && finalPersonality && !guessCorrect && (
        <div className="fixed inset-0 z-40 ba-modal-backdrop flex items-center justify-center p-4">
          <div className="ba-modal max-w-md text-center">
            <div className="text-7xl mb-3">{finalPersonality.emoji}</div>
            <div className="text-2xl font-black ba-gradient mb-2">I THINK IT&apos;S...</div>
            <div className="text-3xl font-black mb-1">{finalPersonality.name}</div>
            <div className="text-white/70 mb-1">{finalPersonality.profession}</div>
            <div className="flex flex-wrap items-center justify-center gap-2 my-3">
              <span className="ba-chip rounded-full px-3 py-1 text-xs">{finalPersonality.category}</span>
              {finalPersonality.region && (
                <span className="ba-chip rounded-full px-3 py-1 text-xs">📍 {finalPersonality.region}</span>
              )}
            </div>
            {isCloseCall && topTwo[1].personality.id !== finalPersonality.id && (
              <div className="ba-card rounded-xl p-3 mb-4 text-left border border-orange-400/40">
                <div className="text-[10px] font-black text-orange-400 tracking-wider mb-1">🔥 CLOSE CALL</div>
                <div className="text-xs text-white/75">
                  My other top suspect is <span className="font-bold text-white">{topTwo[1].personality.name}</span>.
                  One more clue would settle it!
                </div>
              </div>
            )}
            <div className="ba-card rounded-xl p-3 mb-4 text-left">
              <div className="text-[10px] font-black text-orange-400 tracking-wider mb-1">📌 CASE FILE</div>
              <div className="text-sm text-white/85 mb-1">
                <span className="text-white/50">Known for: </span>
                {finalPersonality.famousFor}
              </div>
              {finalPersonality.achievements[0] && (
                <div className="text-xs text-white/65">
                  <span className="text-white/40">⭐ </span>
                  {finalPersonality.achievements[0]}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleConfirm} className="ba-btn ba-primary py-3 text-lg">
                ✓ {t(lang, "youGotIt")}
              </button>
              <button onClick={handleDeny} className="ba-btn ba-secondary py-3 text-lg">
                ✗ {t(lang, "nope")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration card when the guess was correct */}
      {phase === "guess" && finalPersonality && guessCorrect && (
        <div className="fixed inset-0 z-40 ba-modal-backdrop flex items-center justify-center p-4">
          <div className="ba-modal max-w-md text-center">
            <div className="text-7xl mb-3 animate-bounce">🏆</div>
            <div className="text-4xl font-black ba-gradient mb-2">CASE SOLVED!</div>
            <div className="text-white/85 mb-1">
              {finalPersonality.emoji} <span className="font-black">{finalPersonality.name}</span>
            </div>
            <div className="text-white/60 text-sm mb-4">
              {finalPersonality.profession} · {finalPersonality.category}
            </div>
            <div className="ba-card rounded-xl p-3 mb-4">
              <div className="text-2xl font-black ba-gradient-alt">+{gameState.score} pts</div>
              <div className="text-xs text-white/60">
                {gameState.questionCount} questions · {Math.round(gameState.confidence * 100)}% confidence
              </div>
            </div>
            <div className="text-sm text-white/70 italic">"YES! Main jaanta tha! 🎉"</div>
          </div>
        </div>
      )}

      <AchievementToast achievementId={unlockedAch} onClose={() => setUnlockedAch(null)} />
    </div>
  );
}

function getOpeningLine(mode: string, lang: Lang): string {
  const lines: Record<Lang, string> = {
    en: `Case started: ${mode}. Let me investigate the clues! 🕵️`,
    hi: `केस शुरू: ${mode}। चलो सुराग ढूँढते हैं! 🕵️`,
    hinglish: `Case shuru: ${mode}. Chalo clues dhoondhte hain! 🕵️`,
    ta: `வழக்கு தொடங்கியது: ${mode}. குறிப்புகளை தேடுவோம்! 🕵️`,
  };
  return lines[lang];
}
