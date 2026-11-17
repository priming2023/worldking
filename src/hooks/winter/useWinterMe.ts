"use client";

import { useCallback, useEffect, useState } from "react";

export type WinterSession = {
  status: "idle" | "playing" | "finished";
  finishReason: "early" | "timeout" | null;
  timeLimitMin: number | null;
  startedAt: string | null;
  endsAt: string | null;
  remainingMs: number | null;
  foundCount: number;
  foundCodes: string[];
  total: number;
  expectedCoins: number;
  canClaim: boolean;
  claimedToday: boolean;
  todayClaim: {
    coinAmount: number;
    timeLimitMin: number;
    finishReason: string;
  } | null;
};

export function useWinterMe(deviceId: string | null) {
  const [session, setSession] = useState<WinterSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!deviceId) return;
    setError(null);
    try {
      const res = await fetch(`/api/winter/me?deviceId=${deviceId}`);
      if (!res.ok) {
        setError("진행 정보를 불러오지 못했어요.");
        return;
      }
      setSession((await res.json()) as WinterSession);
    } catch {
      setError("네트워크 오류가 났어요.");
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { session, loading, error, reload };
}
