import { expectedCodeForStep, MISSION_TOTAL } from "@/lib/blackfriday/codes";

export const CLAIM_MIN = 5;

export type RewardMode = "ordered" | "unordered" | "partial" | "in_progress";

export type RewardEstimate = {
  coins: number;
  mode: RewardMode;
  canClaim: boolean;
};

type ScanRow = { code: string; sequenceIndex: number };

export function isPerfectOrder(scans: ScanRow[]): boolean {
  if (scans.length !== MISSION_TOTAL) return false;
  const sorted = [...scans].sort((a, b) => a.sequenceIndex - b.sequenceIndex);
  for (let i = 0; i < MISSION_TOTAL; i += 1) {
    if (sorted[i]?.code !== expectedCodeForStep(i + 1)) return false;
  }
  return true;
}

export function estimateReward(
  orderedMode: boolean,
  scans: ScanRow[],
  quizzesPassed: number,
): RewardEstimate {
  const count = scans.length;

  if (
    orderedMode &&
    count === MISSION_TOTAL &&
    isPerfectOrder(scans) &&
    quizzesPassed === MISSION_TOTAL
  ) {
    return { coins: 20, mode: "ordered", canClaim: true };
  }

  if (count >= MISSION_TOTAL) {
    return { coins: 10, mode: "unordered", canClaim: true };
  }

  if (count >= CLAIM_MIN) {
    return { coins: count, mode: "partial", canClaim: true };
  }

  return {
    coins: count,
    mode: orderedMode ? "in_progress" : "partial",
    canClaim: false,
  };
}
