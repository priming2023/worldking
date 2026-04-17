/** 0~9개 구간에서 보여 줄 격려 문구 */
export const ENCOURAGEMENTS = [
  "조금만 더 찾아볼까요? 보물이 숨어 있어요!",
  "대단해요! 다음 보물은 어디에 있을까요?",
  "눈을 크게 뜨고 주변을 살펴보아요!",
  "보물 지도를 머릿속에 그려보면 더 쉬워요!",
  "하나씩 찾을 때마다 코인이 쌓여요. 화이팅!",
] as const;

export function pickEncouragement(seed: number): string {
  const i = Math.abs(seed) % ENCOURAGEMENTS.length;
  return ENCOURAGEMENTS[i];
}
