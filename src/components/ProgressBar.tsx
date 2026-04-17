"use client";

import { TREASURE_TOTAL } from "@/lib/treasure-codes";

type ProgressBarProps = {
  found: number;
  labelId?: string;
};

/** 20칸 시각 진행 — 아이가 ‘얼마나 찼는지’ 한눈에 보게 */
export function ProgressBar({ found, labelId }: ProgressBarProps) {
  const safe = Math.min(Math.max(found, 0), TREASURE_TOTAL);

  return (
    <div className="w-full">
      <div
        className="flex gap-1 sm:gap-1.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TREASURE_TOTAL}
        aria-valuenow={safe}
        aria-labelledby={labelId}
      >
        {Array.from({ length: TREASURE_TOTAL }, (_, i) => {
          const filled = i < safe;
          return (
            <span
              key={i}
              className={`h-3 min-w-0 flex-1 rounded-full border border-amber-900/10 sm:h-3.5 ${
                filled
                  ? "bg-gradient-to-b from-amber-400 to-orange-500 shadow-sm"
                  : "bg-amber-100/90"
              }`}
              aria-hidden
            />
          );
        })}
      </div>
      <p className="mt-2 text-center text-sm font-medium text-amber-900/70">
        보물 상자 {safe} / {TREASURE_TOTAL}
      </p>
    </div>
  );
}
