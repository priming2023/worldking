"use client";

const FLAKES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 10) * 0.45}s`,
  duration: `${8 + (i % 7)}s`,
  size: `${0.55 + (i % 5) * 0.18}rem`,
  drift: `${((i % 9) - 4) * 12}px`,
  char: i % 3 === 0 ? "❄" : "•",
}));

export function WinterSnow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FLAKES.map((flake) => (
        <span
          key={flake.id}
          className="winter-snowflake"
          style={{
            left: flake.left,
            fontSize: flake.size,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            ["--drift" as string]: flake.drift,
          }}
        >
          {flake.char}
        </span>
      ))}
    </div>
  );
}
