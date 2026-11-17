"use client";

import { useEffect, useState } from "react";

/** endsAt ISO 기준으로 남은 ms를 1초마다 갱신 */
export function useWinterTimer(endsAt: string | null, active: boolean) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!active || !endsAt) {
      setRemainingMs(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, new Date(endsAt).getTime() - Date.now());
      setRemainingMs(left);
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endsAt, active]);

  return remainingMs;
}

export function formatMmSs(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
