import { Suspense } from "react";
import GameInner from "./inner";

export default function GamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/70">Loading case file...</div>}>
      <GameInner />
    </Suspense>
  );
}
