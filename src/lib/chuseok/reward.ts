import { MISSION_TOTAL } from "@/lib/chuseok/codes";

/** 카운터 수령 최소 개수 (예전 보물찾기 10개 → 추석 미션 5개) */
export const CLAIM_MIN = 5;

export type RewardMode = "ordered" | "unordered" | "partial" | "in_progress";

export type RewardEstimate = {
  coins: number;
  mode: RewardMode;
  canClaim: boolean;
};

type ScanRow = { code: string; sequenceIndex: number };

/** 스캔 순서가 WK01→WK10 완벽 순서인지 */
export function isPerfectOrder(scans: ScanRow[]): boolean {
  if (scans.length !== MISSION_TOTAL) return false;
  const sorted = [...scans].sort((a, b) => a.sequenceIndex - b.sequenceIndex);
  for (let i = 0; i < MISSION_TOTAL; i++) {
    const expected = `WK${String(i + 1).padStart(2, "0")}`;
    if (sorted[i]?.code !== expected) return false;
  }
  return true;
}

export function estimateReward(
  orderedMode: boolean,
  scans: ScanRow[],
  quizzesPassed: number,
): RewardEstimate {
  const count = scans.length;

  // 순서대로 퀴즈+QR 10개 완주 → 20코인
  if (
    orderedMode &&
    count === MISSION_TOTAL &&
    isPerfectOrder(scans) &&
    quizzesPassed === MISSION_TOTAL
  ) {
    return { coins: 20, mode: "ordered", canClaim: true };
  }

  // 10개 모두 (순서 무관) → 10코인
  if (count >= MISSION_TOTAL) {
    return { coins: 10, mode: "unordered", canClaim: true };
  }

  // 5개 이상 → 찾은 개수만큼 카운터 수령 가능
  if (count >= CLAIM_MIN) {
    return { coins: count, mode: "partial", canClaim: true };
  }

  return {
    coins: count,
    mode: orderedMode ? "in_progress" : "partial",
    canClaim: false,
  };
}
