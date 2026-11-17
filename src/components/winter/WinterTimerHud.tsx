"use client";

import { formatMmSs } from "@/hooks/winter/useWinterTimer";

type Props = {
  remainingMs: number;
  foundCount: number;
  total: number;
  timeLimitMin: number | null;
};

export function WinterTimerHud({ remainingMs, foundCount, total, timeLimitMin }: Props) {
  const urgent = remainingMs <= 60_000;
  const critical = remainingMs <= 15_000;

  return (
    <div className="winter-card flex items-center gap-3 rounded-2xl px-3 py-2.5">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center text-3xl ${
          urgent ? "winter-bomb-urgent" : "winter-bomb-idle"
        }`}
        aria-hidden
      >
        🧨
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] tracking-wide text-white/65">
          {timeLimitMin ? `${timeLimitMin}분 타임어택` : "타임어택"} · 남은 시간
        </p>
        <p
          className={`font-mono text-3xl font-bold tabular-nums ${
            critical ? "text-[var(--winter-crimson)]" : urgent ? "text-[#ffb4a8]" : "text-white"
          }`}
        >
          {formatMmSs(remainingMs)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[11px] text-white/65">찾은 보물</p>
        <p className="text-xl font-bold text-[var(--winter-gold)]">
          {foundCount}
          <span className="text-sm text-white/60">/{total}</span>
        </p>
      </div>
    </div>
  );
}
