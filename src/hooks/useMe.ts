"use client";

import { useCallback, useEffect, useState } from "react";

export type MeResponse = {
  foundCount: number;
  claimedToday: boolean;
  todayClaim: { countAtClaim: number; claimDateKst: string } | null;
};

export function useMe(deviceId: string | null) {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/me?deviceId=${encodeURIComponent(deviceId)}`);
      if (!res.ok) throw new Error("me_failed");
      const json = (await res.json()) as MeResponse;
      setData(json);
    } catch {
      setError("불러오기에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  return { data, loading, error, refresh };
}
