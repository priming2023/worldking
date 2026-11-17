"use client";

import { useMemo, useState } from "react";
import { WINTER_TIME_OPTIONS, type WinterTimeLimitMin } from "@/lib/winter/time-options";

const SEGMENT = 360 / WINTER_TIME_OPTIONS.length;
const SPIN_MS = 6800;

type Props = {
  disabled?: boolean;
  onSpun: (minutes: WinterTimeLimitMin) => void;
};

export function WinterWheel({ disabled, onSpun }: Props) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WinterTimeLimitMin | null>(null);

  const gradient = useMemo(() => {
    const colors = ["#163a5c", "#2a6a96", "#1a4a72", "#3d84b0", "#163a5c", "#2a6a96", "#1a4a72", "#3d84b0", "#163a5c", "#2a6a96"];
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
    // 포인터(상단)에 칸 중앙이 오도록, 현재 각도 기준으로 delta 계산
    const targetCenter = index * SEGMENT + SEGMENT / 2;
    const desiredMod = (360 - targetCenter + 360) % 360;

    setSpinning(true);
    setResult(null);
    setRotation((prev) => {
      const currentMod = ((prev % 360) + 360) % 360;
      let delta = desiredMod - currentMod;
      if (delta <= 0) delta += 360;
      const turns = 4 + Math.floor(Math.random() * 3);
      return prev + turns * 360 + delta;
    });

    window.setTimeout(() => {
      setResult(minutes);
      setSpinning(false);
      onSpun(minutes);
    }, SPIN_MS);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-72 w-72">
        <div
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 text-3xl leading-none text-[var(--winter-gold)] drop-shadow"
          aria-hidden
        >
          ▼
        </div>
        <div
          className="winter-wheel absolute inset-4 rounded-full border-4 border-[var(--winter-gold)] shadow-[0_0_0_8px_rgb(255_255_255_/_0.1),0_12px_40px_rgb(0_0_0_/_0.35)]"
          style={{
            background: gradient,
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? `${SPIN_MS}ms` : "0ms",
          }}
        >
          {WINTER_TIME_OPTIONS.map((min, i) => {
            const mid = i * SEGMENT + SEGMENT / 2;
            return (
              <span
                key={min}
                className="absolute left-1/2 top-1/2 text-base font-extrabold tabular-nums text-white"
                style={{
                  transform: `translate(-50%, -50%) rotate(${mid}deg) translateY(-88px) rotate(${-(mid + rotation)}deg)`,
                }}
              >
                {min}
              </span>
            );
          })}
          <div className="absolute inset-[36%] rounded-full bg-[#0c1f33] shadow-inner ring-2 ring-white/10" />
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
