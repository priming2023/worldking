/** 1개 이상이면 찾은 개수만큼 코인 수령 */
export const WINTER_CLAIM_MIN = 1;

export type WinterRewardEstimate = {
  coins: number;
  canClaim: boolean;
};

export function estimateWinterReward(foundCount: number): WinterRewardEstimate {
  return {
    coins: foundCount,
    canClaim: foundCount >= WINTER_CLAIM_MIN,
  };
}
