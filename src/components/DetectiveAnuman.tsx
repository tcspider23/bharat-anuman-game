"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

export type Mood =
  | "neutral"
  | "smile"           // 1st YES - small smile, eyebrow raise
  | "confident"       // 2nd YES - bigger smile, excited pose
  | "clap"            // 3rd YES - clap
  | "spin"            // 3rd YES - stylish rotation
  | "confused"        // 1st NO - mild confusion, head tilt
  | "moreConfused"    // 2nd NO - stronger confusion
  | "intense"         // 3rd NO - brain mode, hands on temples
  | "celebrate"       // correct guess
  | "determined";     // wrong guess, giving comeback

type Props = {
  mood?: Mood;
  onClick?: () => void;
};

// Premium Detective Anuman — a friendly Indian detective mascot
export default function DetectiveAnuman({ mood = "neutral", onClick }: Props) {
  const animationClass = useMemo(() => {
    switch (mood) {
      case "smile":
        return "detective-bob";
      case "confident":
        return "detective-bob";
      case "clap":
        return "detective-clap";
      case "spin":
        return "detective-spin";
      case "confused":
        return "detective-tilt-left";
      case "moreConfused":
        return "detective-tilt-right";
      case "intense":
        return "detective-intense";
      case "celebrate":
        return "detective-clap";
      case "determined":
        return "";
      default:
        return "detective-float";
    }
  }, [mood]);

  const magnifierClass =
    mood === "confused" || mood === "moreConfused" ? "magnifier-wiggle" : "";
  const brainClass = mood === "intense" ? "brain-pulse" : "";

  return (
    <div
      className={`detective-wrap ${animationClass} ${brainClass}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Detective Anuman"
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <svg
        className="detective-svg"
        viewBox="0 0 280 340"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="coatGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8b5a3c" />
            <stop offset="0.5" stopColor="#6b4226" />
            <stop offset="1" stopColor="#3d2515" />
          </linearGradient>
          <linearGradient id="coatShadow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#2a1708" stopOpacity="0.6" />
            <stop offset="0.5" stopColor="#2a1708" stopOpacity="0" />
            <stop offset="1" stopColor="#2a1708" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#f0c9a4" />
            <stop offset="1" stopColor="#d4996e" />
          </linearGradient>
          <radialGradient id="skinShine" cx="0.3" cy="0.3">
            <stop offset="0" stopColor="#ffe8d0" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ffe8d0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hatGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#4a2e1c" />
            <stop offset="1" stopColor="#1d100a" />
          </linearGradient>
          <radialGradient id="glassGrad" cx="0.3" cy="0.3">
            <stop offset="0" stopColor="#e0f7fa" stopOpacity="0.85" />
            <stop offset="0.7" stopColor="#4dd0e1" stopOpacity="0.5" />
            <stop offset="1" stopColor="#0097a7" stopOpacity="0.3" />
          </radialGradient>
          <filter id="softShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="3" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Body / Trench coat */}
        <g filter="url(#softShadow)">
          {/* Coat base */}
          <path
            d="M 60 330 L 75 205 Q 85 180 110 175 L 170 175 Q 195 180 205 205 L 220 330 Z"
            fill="url(#coatGrad)"
            stroke="#2a1708"
            strokeWidth="2"
          />
          {/* Coat shading */}
          <path
            d="M 60 330 L 75 205 Q 85 180 110 175 L 170 175 Q 195 180 205 205 L 220 330 Z"
            fill="url(#coatShadow)"
            opacity="0.5"
          />
          {/* Left lapel */}
          <path
            d="M 108 180 L 128 220 L 138 260 L 124 270 L 108 210 Z"
            fill="#5a3620"
            stroke="#2a1708"
            strokeWidth="1.5"
          />
          {/* Right lapel */}
          <path
            d="M 172 180 L 152 220 L 142 260 L 156 270 L 172 210 Z"
            fill="#5a3620"
            stroke="#2a1708"
            strokeWidth="1.5"
          />
          {/* Shirt */}
          <path d="M 124 205 L 140 262 L 156 205 Z" fill="#f5f5f5" />
          {/* Tie */}
          <path d="M 136 210 L 144 210 L 142 238 L 140 248 L 138 238 Z" fill="#c62841" />
          <circle cx="140" cy="215" r="1.5" fill="#8a1b2d" />
          {/* Buttons */}
          <circle cx="130" cy="275" r="3.5" fill="#f7c948" stroke="#8a6a1e" strokeWidth="0.8" />
          <circle cx="130" cy="300" r="3.5" fill="#f7c948" stroke="#8a6a1e" strokeWidth="0.8" />
          {/* Belt */}
          <rect x="78" y="250" width="124" height="6" fill="#2a1708" />
          <rect x="134" y="249" width="12" height="8" fill="#f7c948" stroke="#8a6a1e" strokeWidth="0.5" />
        </g>

        {/* Arms */}
        <Arm mood={mood} side="left" />
        <Arm mood={mood} side="right" />

        {/* Neck */}
        <rect x="130" y="158" width="20" height="22" fill="url(#skinGrad)" />
        <path d="M 130 162 Q 140 165 150 162" stroke="#8a5a38" strokeWidth="1" fill="none" opacity="0.5" />

        {/* Head */}
        <g>
          {/* Face base */}
          <ellipse cx="140" cy="115" rx="54" ry="60" fill="url(#skinGrad)" stroke="#8a5a38" strokeWidth="1.5" />
          {/* Face shine */}
          <ellipse cx="125" cy="95" rx="20" ry="25" fill="url(#skinShine)" />
          {/* Ears */}
          <ellipse cx="87" cy="120" rx="9" ry="13" fill="url(#skinGrad)" stroke="#8a5a38" strokeWidth="1" />
          <path d="M 86 118 Q 88 122 86 126" stroke="#8a5a38" strokeWidth="0.8" fill="none" />
          <ellipse cx="193" cy="120" rx="9" ry="13" fill="url(#skinGrad)" stroke="#8a5a38" strokeWidth="1" />
          <path d="M 194 118 Q 192 122 194 126" stroke="#8a5a38" strokeWidth="0.8" fill="none" />

          {/* Cheek blush when happy */}
          {(mood === "smile" || mood === "confident" || mood === "celebrate") && (
            <>
              <ellipse cx="108" cy="140" rx="9" ry="5" fill="#ff8a8a" opacity="0.35" />
              <ellipse cx="172" cy="140" rx="9" ry="5" fill="#ff8a8a" opacity="0.35" />
            </>
          )}

          {/* Mustache - well groomed */}
          <path
            d="M 113 138 Q 120 136 130 138 Q 135 140 140 139 Q 145 140 150 138 Q 160 136 167 138 Q 165 142 158 142 Q 150 142 145 140 Q 140 141 135 140 Q 130 142 122 142 Q 115 142 113 138 Z"
            fill="#2a1708"
          />
          {/* Mustache curls */}
          <path d="M 113 138 Q 110 137 108 135" stroke="#2a1708" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 167 138 Q 170 137 172 135" stroke="#2a1708" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Eyebrows */}
          {getEyebrows(mood)}

          {/* Eyes */}
          {getEyes(mood)}

          {/* Nose */}
          <path d="M 140 120 Q 138 128 136 132 Q 140 133 144 132 Q 142 128 140 120" stroke="#8a5a38" strokeWidth="1" fill="none" opacity="0.5" />

          {/* Mouth */}
          {getMouth(mood)}
        </g>

        {/* Detective hat - classic deerstalker-style */}
        <g>
          {/* Hat brim */}
          <ellipse cx="140" cy="72" rx="70" ry="11" fill="url(#hatGrad)" />
          <ellipse cx="140" cy="70" rx="70" ry="9" fill="#3a2416" />
          {/* Crown */}
          <path
            d="M 90 70 Q 88 42 140 36 Q 192 42 190 70 Z"
            fill="url(#hatGrad)"
          />
          {/* Hat band */}
          <rect x="90" y="68" width="100" height="7" fill="#c62841" />
          <rect x="90" y="68" width="100" height="2" fill="#8a1b2d" />
          {/* Hat highlight */}
          <path d="M 100 68 Q 96 52 120 44" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" fill="none" />
          {/* Hat buckle */}
          <rect x="134" y="69" width="12" height="5" fill="#f7c948" rx="1" />
        </g>

        {/* Magnifying glass - in right hand */}
        <g className={magnifierClass} style={{ transformOrigin: "215px 230px" }}>
          <circle cx="232" cy="198" r="30" fill="url(#glassGrad)" stroke="#f7c948" strokeWidth="5" />
          <circle cx="232" cy="198" r="30" fill="none" stroke="#8a6a1e" strokeWidth="1" opacity="0.5" />
          <circle cx="232" cy="198" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="214" y1="220" x2="194" y2="246" stroke="#8a6a1e" strokeWidth="7" strokeLinecap="round" />
          <line x1="214" y1="220" x2="194" y2="246" stroke="#c9a563" strokeWidth="3" strokeLinecap="round" />
          <circle cx="222" cy="188" r="7" fill="white" opacity="0.6" />
        </g>

        {/* Sweat drops when confused */}
        {(mood === "confused" || mood === "moreConfused") && (
          <>
            <path d="M 200 105 Q 204 112 200 118 Q 196 112 200 105 Z" fill="#4dd0e1" opacity="0.8" />
            <path d="M 85 105 Q 89 112 85 118 Q 81 112 85 105 Z" fill="#4dd0e1" opacity="0.6" />
          </>
        )}

        {/* Brain waves / sparkles for intense thinking */}
        {mood === "intense" && (
          <g>
            <text x="55" y="45" fontSize="22" fill="#f7c948" opacity="0.9">🧠</text>
            <text x="215" y="45" fontSize="22" fill="#f7c948" opacity="0.9">💡</text>
            <text x="35" y="85" fontSize="16" fill="#ff9933" opacity="0.7">✨</text>
            <text x="230" y="85" fontSize="16" fill="#ff9933" opacity="0.7">✨</text>
          </g>
        )}

        {/* Sparkles for celebration */}
        {(mood === "confident" || mood === "clap" || mood === "celebrate") && (
          <g>
            <text x="45" y="100" fontSize="18" fill="#f7c948">✨</text>
            <text x="230" y="100" fontSize="18" fill="#f7c948">✨</text>
            <text x="60" y="160" fontSize="14" fill="#ff9933">⭐</text>
          </g>
        )}
      </svg>

      {/* Floating decorations */}
      {mood === "clap" && (
        <>
          <div className="sparkle" style={{ top: 10, left: 30, animationDelay: "0s" }}>✨</div>
          <div className="sparkle" style={{ top: 10, right: 30, animationDelay: "0.2s" }}>✨</div>
          <div className="sparkle" style={{ top: 20, left: 140, animationDelay: "0.4s" }}>👏</div>
        </>
      )}
      {mood === "spin" && (
        <>
          <div className="sparkle" style={{ top: 20, left: 50, animationDelay: "0s" }}>🌟</div>
          <div className="sparkle" style={{ top: 20, right: 50, animationDelay: "0.3s" }}>🌟</div>
        </>
      )}
      {(mood === "confused" || mood === "moreConfused") && (
        <>
          <div className="question-mark" style={{ top: 5, left: 15, animationDelay: "0s" }}>?</div>
          <div className="question-mark" style={{ top: 5, right: 15, animationDelay: "0.3s" }}>?</div>
          {mood === "moreConfused" && (
            <div className="question-mark" style={{ top: 30, left: 140, animationDelay: "0.6s" }}>?</div>
          )}
        </>
      )}
    </div>
  );
}

function getEyebrows(mood: Mood): ReactNode {
  switch (mood) {
    case "neutral":
      return (
        <>
          <path d="M 113 96 Q 124 93 135 96" stroke="#2a1708" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 145 96 Q 156 93 167 96" stroke="#2a1708" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "smile":
      // one eyebrow slightly raised
      return (
        <>
          <path d="M 113 96 Q 124 93 135 96" stroke="#2a1708" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 145 90 Q 156 86 167 91" stroke="#2a1708" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "confident":
      return (
        <>
          <path d="M 113 90 Q 124 86 135 91" stroke="#2a1708" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 145 90 Q 156 86 167 91" stroke="#2a1708" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      );
    case "clap":
    case "celebrate":
      return (
        <>
          <path d="M 113 86 Q 124 80 135 85" stroke="#2a1708" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 145 85 Q 156 80 167 86" stroke="#2a1708" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "spin":
      return (
        <>
          <path d="M 113 84 Q 124 78 135 83" stroke="#2a1708" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 145 83 Q 156 78 167 84" stroke="#2a1708" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "confused":
      return (
        <>
          <path d="M 113 98 Q 124 95 135 92" stroke="#2a1708" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 145 92 Q 156 95 167 98" stroke="#2a1708" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "moreConfused":
      return (
        <>
          <path d="M 113 101 Q 124 96 135 91" stroke="#2a1708" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 145 91 Q 156 96 167 101" stroke="#2a1708" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "intense":
      return (
        <>
          <path d="M 113 103 Q 124 96 135 92" stroke="#2a1708" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 145 92 Q 156 96 167 103" stroke="#2a1708" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      );
    case "determined":
      return (
        <>
          <path d="M 113 99 Q 124 94 135 91" stroke="#2a1708" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 145 91 Q 156 94 167 99" stroke="#2a1708" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}

function getEyes(mood: Mood): ReactNode {
  const eyeColor = "#2a1708";
  switch (mood) {
    case "smile":
      return (
        <>
          <ellipse cx="118" cy="113" rx="7.5" ry="8.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <ellipse cx="162" cy="113" rx="7" ry="6.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <circle cx="119" cy="114" r="4.5" fill={eyeColor} />
          <circle cx="163" cy="114" r="4.5" fill={eyeColor} />
          <circle cx="120" cy="112" r="1.8" fill="white" />
          <circle cx="164" cy="112" r="1.8" fill="white" />
        </>
      );
    case "confident":
    case "clap":
    case "celebrate":
      return (
        <>
          <path d="M 110 113 Q 118 108 126 113" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 154 113 Q 162 108 170 113" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "spin":
      return (
        <>
          <path d="M 110 113 Q 118 106 126 113" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 154 113 Q 162 106 170 113" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "confused":
      return (
        <>
          <ellipse cx="118" cy="113" rx="8.5" ry="9.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <ellipse cx="162" cy="113" rx="7.5" ry="7.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <circle cx="120" cy="115" r="4.5" fill={eyeColor} />
          <circle cx="162" cy="113" r="4.5" fill={eyeColor} />
          <circle cx="121" cy="113" r="1.8" fill="white" />
        </>
      );
    case "moreConfused":
      return (
        <>
          <ellipse cx="118" cy="113" rx="9.5" ry="10.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <ellipse cx="162" cy="113" rx="9.5" ry="10.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <circle cx="120" cy="116" r="5" fill={eyeColor} />
          <circle cx="163" cy="116" r="5" fill={eyeColor} />
          <circle cx="121" cy="114" r="2" fill="white" />
          <circle cx="164" cy="114" r="2" fill="white" />
        </>
      );
    case "intense":
      return (
        <>
          <ellipse cx="118" cy="115" rx="7.5" ry="5.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <ellipse cx="162" cy="115" rx="7.5" ry="5.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <circle cx="118" cy="115" r="4" fill={eyeColor} />
          <circle cx="162" cy="115" r="4" fill={eyeColor} />
          <circle cx="119" cy="114" r="1.3" fill="#ff9933" />
          <circle cx="163" cy="114" r="1.3" fill="#ff9933" />
        </>
      );
    case "determined":
      return (
        <>
          <ellipse cx="118" cy="114" rx="7.5" ry="6.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <ellipse cx="162" cy="114" rx="7.5" ry="6.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <circle cx="118" cy="114" r="4.5" fill={eyeColor} />
          <circle cx="162" cy="114" r="4.5" fill={eyeColor} />
          <circle cx="119" cy="112" r="1.8" fill="white" />
          <circle cx="163" cy="112" r="1.8" fill="white" />
        </>
      );
    default:
      return (
        <>
          <ellipse cx="118" cy="113" rx="7.5" ry="8.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <ellipse cx="162" cy="113" rx="7.5" ry="8.5" fill="white" stroke="#2a1708" strokeWidth="0.8" />
          <circle cx="118" cy="114" r="4.5" fill={eyeColor} />
          <circle cx="162" cy="114" r="4.5" fill={eyeColor} />
          <circle cx="119" cy="112" r="1.8" fill="white" />
          <circle cx="163" cy="112" r="1.8" fill="white" />
        </>
      );
  }
}

function getMouth(mood: Mood): ReactNode {
  switch (mood) {
    case "neutral":
      return <path d="M 124 153 Q 140 156 156 153" stroke="#2a1708" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    case "smile":
      return <path d="M 124 152 Q 140 160 156 152" stroke="#2a1708" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    case "confident":
      return (
        <path d="M 121 150 Q 140 166 159 150" stroke="#2a1708" strokeWidth="2.5" fill="#c62841" strokeLinecap="round" />
      );
    case "clap":
    case "celebrate":
      return (
        <>
          <ellipse cx="140" cy="155" rx="15" ry="10" fill="#2a1708" />
          <path d="M 128 153 Q 140 162 152 153" fill="#c62841" />
          <rect x="132" y="151" width="16" height="3" fill="white" />
        </>
      );
    case "spin":
      return <ellipse cx="140" cy="153" rx="13" ry="11" fill="#2a1708" />;
    case "confused":
      return <path d="M 127 155 Q 140 151 153 155" stroke="#2a1708" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    case "moreConfused":
      return (
        <path
          d="M 124 155 Q 132 150 140 156 Q 148 150 156 155"
          stroke="#2a1708"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "intense":
      return <path d="M 125 156 L 155 156" stroke="#2a1708" strokeWidth="3" strokeLinecap="round" />;
    case "determined":
      return <path d="M 127 155 Q 140 153 153 155" stroke="#2a1708" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    default:
      return null;
  }
}

function Arm({ mood, side }: { mood: Mood; side: "left" | "right" }) {
  if (mood === "clap") {
    if (side === "left") {
      return (
        <g>
          <path
            d="M 85 225 Q 115 233 132 232 L 137 248 Q 120 250 90 242 Z"
            fill="url(#coatGrad)"
            stroke="#2a1708"
            strokeWidth="2"
          />
          <circle cx="134" cy="240" r="11" fill="url(#skinGrad)" stroke="#8a5a38" strokeWidth="1" />
        </g>
      );
    }
    return (
      <g>
        <path
          d="M 195 225 Q 165 233 148 232 L 143 248 Q 160 250 190 242 Z"
          fill="url(#coatGrad)"
          stroke="#2a1708"
          strokeWidth="2"
        />
        <circle cx="146" cy="240" r="11" fill="url(#skinGrad)" stroke="#8a5a38" strokeWidth="1" />
      </g>
    );
  }
  if (mood === "intense") {
    if (side === "left") {
      return (
        <g>
          <path
            d="M 80 215 Q 95 180 110 150 L 120 155 Q 108 188 92 225 Z"
            fill="url(#coatGrad)"
            stroke="#2a1708"
            strokeWidth="2"
          />
          <ellipse cx="115" cy="148" rx="11" ry="9" fill="url(#skinGrad)" stroke="#8a5a38" strokeWidth="1" />
        </g>
      );
    }
    return (
      <g>
        <path
          d="M 200 220 Q 197 260 187 285 L 177 283 Q 185 258 190 222 Z"
          fill="url(#coatGrad)"
          stroke="#2a1708"
          strokeWidth="2"
        />
      </g>
    );
  }
  if (mood === "confident" || mood === "celebrate") {
    if (side === "right") {
      return (
        <g>
          <path
            d="M 200 200 Q 238 195 248 208 L 243 220 Q 228 214 195 218 Z"
            fill="url(#coatGrad)"
            stroke="#2a1708"
            strokeWidth="2"
          />
          <circle cx="248" cy="214" r="9" fill="url(#skinGrad)" stroke="#8a5a38" strokeWidth="1" />
        </g>
      );
    }
    return null;
  }
  if (mood === "determined") {
    if (side === "left") {
      return (
        <g>
          <path
            d="M 85 218 Q 125 228 162 223 L 162 233 Q 125 238 85 231 Z"
            fill="url(#coatGrad)"
            stroke="#2a1708"
            strokeWidth="2"
          />
        </g>
      );
    }
    return (
      <g>
        <path
          d="M 195 218 Q 155 228 118 223 L 118 233 Q 155 238 195 231 Z"
          fill="url(#coatGrad)"
          stroke="#2a1708"
          strokeWidth="2"
        />
      </g>
    );
  }
  if (side === "left") {
    return (
      <g>
        <path
          d="M 78 205 Q 75 245 80 280 L 92 280 Q 90 245 94 208 Z"
          fill="url(#coatGrad)"
          stroke="#2a1708"
          strokeWidth="2"
        />
      </g>
    );
  }
  return (
    <g>
      <path
        d="M 202 202 Q 212 218 207 240 L 197 240 Q 195 220 192 208 Z"
        fill="url(#coatGrad)"
        stroke="#2a1708"
        strokeWidth="2"
      />
    </g>
  );
}
