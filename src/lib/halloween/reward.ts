import { MISSION_TOTAL, expectedCodeForStep } from "@/lib/halloween/codes";

/** 카운터 수령 최소 개수 (추석과 동일: 5개↑) */
export const CLAIM_MIN = 5;

export type RewardMode = "ordered" | "unordered" | "partial" | "in_progress";

export type RewardEstimate = {
  coins: number;
  mode: RewardMode;
  canClaim: boolean;
};

type ScanRow = { code: string; sequenceIndex: number };

/** 스캔 순서가 WK11→WK20 완벽 순서인지 */
export function isPerfectOrder(scans: ScanRow[]): boolean {
  if (scans.length !== MISSION_TOTAL) return false;
  const sorted = [...scans].sort((a, b) => a.sequenceIndex - b.sequenceIndex);
  for (let i = 0; i < MISSION_TOTAL; i++) {
    const expected = expectedCodeForStep(i + 1);
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

  // 순서대로 퀴즈+QR 10개 완주 → 20코인 (x2)
  if (
    orderedMode &&
    count === MISSION_TOTAL &&
    isPerfectOrder(scans) &&
    quizzesPassed === MISSION_TOTAL
  ) {
    return { coins: 20, mode: "ordered", canClaim: true };
  }

  // 10개 모두 (순서 무관 / 순서 포기) → 10코인
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
