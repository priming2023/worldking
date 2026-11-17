"use client";

import { useMemo, useState } from "react";
import { WINTER_TIME_OPTIONS, type WinterTimeLimitMin } from "@/lib/winter/time-options";

const SEGMENT = 360 / WINTER_TIME_OPTIONS.length;

type Props = {
  disabled?: boolean;
  onSpun: (minutes: WinterTimeLimitMin) => void;
};

export function WinterWheel({ disabled, onSpun }: Props) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WinterTimeLimitMin | null>(null);

  const gradient = useMemo(() => {
    const colors = ["#1f4b73", "#2f6a96", "#1f4b73", "#3a7eaa", "#1f4b73", "#2f6a96", "#1f4b73", "#3a7eaa", "#1f4b73", "#2f6a96"];
    const stops = WINTER_TIME_OPTIONS.map((_, i) => {
      const start = i * SEGMENT;
      const end = (i + 1) * SEGMENT;
      return `${colors[i % colors.length]} ${start}deg ${end}deg`;
    });
    return `conic-gradient(from -90deg, ${stops.join(", ")})`;
  }, []);

  function spin() {
    if (disabled || spinning) return;
    const index = Math.floor(Math.random() * WINTER_TIME_OPTIONS.length);
    const minutes = WINTER_TIME_OPTIONS[index]!;
    // 포인터는 상단 고정. 해당 칸 중앙이 위로 오도록 회전
    const targetCenter = index * SEGMENT + SEGMENT / 2;
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const next = extraTurns * 360 + (360 - targetCenter);
    setSpinning(true);
    setResult(null);
    setRotation((prev) => prev + next);
    window.setTimeout(() => {
      setResult(minutes);
      setSpinning(false);
      onSpun(minutes);
    }, 4200);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-64 w-64">
        <div
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 text-2xl text-[var(--winter-gold)]"
          aria-hidden
        >
          ▼
        </div>
        <div
          className="winter-wheel absolute inset-3 rounded-full border-4 border-[var(--winter-gold)] shadow-[0_0_0_6px_rgb(255_255_255_/_0.12)]"
          style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
        >
          {WINTER_TIME_OPTIONS.map((min, i) => {
            const angle = i * SEGMENT + SEGMENT / 2 - 90;
            return (
              <span
                key={min}
                className="absolute left-1/2 top-1/2 origin-center text-sm font-bold text-white"
                style={{
                  transform: `rotate(${angle}deg) translate(0, -78px) rotate(${-angle}deg)`,
                }}
              >
                {min}
              </span>
            );
          })}
          <div className="absolute inset-[34%] rounded-full bg-[#0c1f33] shadow-inner" />
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || spinning}
        onClick={spin}
        className="winter-btn-primary mt-5 w-full max-w-xs rounded-2xl py-3 text-base"
      >
        {spinning ? "돌리는 중…" : result ? "다시 돌리기" : "돌림판 돌리기"}
      </button>

      {result ? (
        <p className="mt-3 text-center text-lg font-bold text-[var(--winter-gold)]">
          {result}분 안에 찾아요!
        </p>
      ) : (
        <p className="mt-3 text-center text-sm text-white/70">제한 시간을 정해 주세요</p>
      )}
    </div>
  );
}
