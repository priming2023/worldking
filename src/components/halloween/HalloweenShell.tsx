import "./halloween.css";

export function HalloweenShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="halloween-theme relative flex min-h-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#0f0618] to-[#050308] text-[#f3e8ff]">
      <div className="halloween-moon pointer-events-none fixed right-5 top-6 h-14 w-14 opacity-70 sm:h-20 sm:w-20" aria-hidden />
      <span className="halloween-deco halloween-deco-bat fixed left-3 top-24" aria-hidden>
        🦇
      </span>
      <span className="halloween-deco halloween-deco-ghost fixed bottom-28 right-6 text-3xl" aria-hidden>
        👻
      </span>
      <span className="halloween-deco halloween-deco-pumpkin fixed bottom-16 left-5 text-3xl" aria-hidden>
        🎃
      </span>
      <span className="halloween-deco fixed left-[40%] top-10 text-2xl opacity-40" aria-hidden>
        🦇
      </span>
      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  );
}
