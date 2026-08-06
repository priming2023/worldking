import "./halloween.css";

export function HalloweenShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="halloween-theme relative flex min-h-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#0f0618] to-[#050308] text-[#f3e8ff]">
      {/* 그믐달 */}
      <div
        className="halloween-moon pointer-events-none fixed right-4 top-5 z-[1] h-16 w-16 sm:right-6 sm:top-6 sm:h-24 sm:w-24"
        aria-hidden
      />

      <span className="halloween-deco halloween-deco-bat left-3 top-20 sm:left-5 sm:top-24" aria-hidden>
        🦇
      </span>
      <span className="halloween-deco halloween-deco-bat right-[28%] top-14 opacity-70" aria-hidden>
        🦇
      </span>
      <span className="halloween-deco halloween-deco-ghost bottom-32 right-3 sm:bottom-36 sm:right-6" aria-hidden>
        👻
      </span>
      <span className="halloween-deco halloween-deco-ghost-sm left-[12%] top-[42%]" aria-hidden>
        👻
      </span>
      <span className="halloween-deco halloween-deco-pumpkin bottom-14 left-3 sm:bottom-16 sm:left-5" aria-hidden>
        🎃
      </span>
      <span
        className="halloween-deco halloween-deco-pumpkin right-8 top-[38%] text-[2.75rem] opacity-80 sm:right-10"
        aria-hidden
      >
        🎃
      </span>

      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  );
}
