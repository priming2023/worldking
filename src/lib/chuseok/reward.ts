import { MISSION_TOTAL } from "@/lib/chuseok/codes";

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

  if (orderedMode && count === MISSION_TOTAL && isPerfectOrder(scans) && quizzesPassed === MISSION_TOTAL) {
    return { coins: 20, mode: "ordered", canClaim: true };
  }

  if (!orderedMode) {
    if (count === 0) {
      return { coins: 0, mode: "partial", canClaim: false };
    }
    if (count >= MISSION_TOTAL) {
      return { coins: 10, mode: "unordered", canClaim: true };
    }
    return { coins: count, mode: "partial", canClaim: true };
  }

  return { coins: 0, mode: "in_progress", canClaim: false };
}
