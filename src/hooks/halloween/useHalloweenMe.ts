"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnswerDisplay } from "@/lib/halloween/answer-pattern";
import type { RewardMode } from "@/lib/halloween/reward";

export type HalloweenMeData = {
  foundCount: number;
  foundCodes: string[];
  claimedToday: boolean;
  todayClaim: { coinAmount: number; rewardMode: string } | null;
  orderedMode: boolean;
  quizzesPassed: number;
  phase: "quiz" | "scan";
  awaitingScanCode: string | null;
  currentQuiz: {
    stepOrder: number;
    question: string;
    answerDisplay: AnswerDisplay;
  } | null;
  locationHint: string | null;
  expectedCoins: number;
  rewardMode: RewardMode;
  canClaim: boolean;
  missionComplete: boolean;
};

export function useHalloweenMe(deviceId: string | null) {
  const [data, setData] = useState<HalloweenMeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/halloween/me?deviceId=${encodeURIComponent(deviceId)}`);
      const json = (await res.json()) as HalloweenMeData & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "불러오기 실패");
        return;
      }
      setData(json as HalloweenMeData);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
