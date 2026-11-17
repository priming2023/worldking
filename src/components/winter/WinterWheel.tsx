"use client";

import { useMemo, useRef, useState } from "react";
import { WINTER_TIME_OPTIONS, type WinterTimeLimitMin } from "@/lib/winter/time-options";

const SEGMENT = 360 / WINTER_TIME_OPTIONS.length;
const SPIN_MS = 6800;
const CX = 100;
const CY = 100;
const R = 96;
const LABEL_R = 70;
const COLORS = ["#163a5c", "#2a6a96", "#1a4a72", "#3d84b0"] as const;

type Props = {
  disabled?: boolean;
  onSpun: (minutes: WinterTimeLimitMin) => void;
};

/** 0° = 위쪽, 시계방향 → SVG 좌표 */
function polar(radius: number, degFromTopCw: number) {
  const theta = ((degFromTopCw - 90) * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(theta),
    y: CY + radius * Math.sin(theta),
  };
}

function wedgePath(startDeg: number, endDeg: number) {
  const start = polar(R, startDeg);
  const end = polar(R, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function WinterWheel({ disabled, onSpun }: Props) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WinterTimeLimitMin | null>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const slices = useMemo(
    () =>
      WINTER_TIME_OPTIONS.map((minutes, i) => {
        const startDeg = i * SEGMENT;
        const endDeg = (i + 1) * SEGMENT;
        const midDeg = startDeg + SEGMENT / 2;
        return {
          minutes,
          midDeg,
          label: polar(LABEL_R, midDeg),
          color: COLORS[i % COLORS.length]!,
          path: wedgePath(startDeg, endDeg),
          // 경계선(시작 각도) — 번호가 경계가 아님을 시각적으로 구분
          tick: polar(R, startDeg),
        };
      }),
    [],
  );

  function spin() {
    if (disabled || spinning || result != null) return;
    const index = Math.floor(Math.random() * WINTER_TIME_OPTIONS.length);
    const minutes = WINTER_TIME_OPTIONS[index]!;
    const midDeg = index * SEGMENT + SEGMENT / 2;
    const desiredMod = (360 - midDeg) % 360;

    const startRot = rotationRef.current;
    const currentMod = ((startRot % 360) + 360) % 360;
    let delta = desiredMod - currentMod;
    if (delta <= 0) delta += 360;
    const turns = 4 + Math.floor(Math.random() * 3);
    const endRot = startRot + turns * 360 + delta;

    setSpinning(true);
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();

    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / SPIN_MS);
      const next = startRot + (endRot - startRot) * easeOutCubic(t);
      rotationRef.current = next;
      setRotation(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }
      rotationRef.current = endRot;
      setRotation(endRot);
      setResult(minutes);
      setSpinning(false);
      onSpun(minutes);
    };

    rafRef.current = requestAnimationFrame(frame);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-72 w-72">
        <div
          className="absolute left-1/2 top-1 z-20 -translate-x-1/2 text-3xl leading-none text-[var(--winter-gold)] drop-shadow"
          aria-hidden
        >
          ▼
        </div>

        <div className="absolute inset-3 rounded-full shadow-[0_0_0_8px_rgb(255_255_255_/_0.1),0_12px_40px_rgb(0_0_0_/_0.35)]">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {slices.map((slice) => (
              <path
                key={`w-${slice.minutes}`}
                d={slice.path}
                fill={slice.color}
                stroke="#d4b06a"
                strokeWidth="1.5"
              />
            ))}

            {/* 번호: 각 칸 중앙(midDeg) + 휠과 같은 각도로 수평 유지 */}
            {slices.map((slice) => (
              <text
                key={`t-${slice.minutes}`}
                x={slice.label.x}
                y={slice.label.y}
                fill="#ffffff"
                fontSize="15"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${-rotation} ${slice.label.x} ${slice.label.y})`}
              >
                {slice.minutes}
              </text>
            ))}

            <circle cx={CX} cy={CY} r="34" fill="#0c1f33" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#d4b06a" strokeWidth="4" />
          </svg>
        </div>
      </div>

      {result == null ? (
        <button
          type="button"
          disabled={disabled || spinning}
          onClick={spin}
          className="winter-btn-primary mt-5 w-full max-w-xs rounded-2xl py-3 text-base"
        >
          {spinning ? "돌리는 중…" : "돌림판 돌리기"}
        </button>
      ) : (
        <p className="mt-5 text-center text-lg font-bold text-[var(--winter-gold)]">
          {result}분 안에 찾아요!
        </p>
      )}

      {result == null && !spinning ? (
        <p className="mt-3 text-center text-sm text-white/70">제한 시간을 정해 주세요</p>
      ) : null}
    </div>
  );
}
