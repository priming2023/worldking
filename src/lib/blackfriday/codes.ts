/** 블랙프라이데이에서 다시 쓰는 기존 보물 QR (WK01~WK10) */
export const MISSION_TOTAL = 10;

export const MISSION_CODES: readonly string[] = Array.from(
  { length: MISSION_TOTAL },
  (_, i) => `WK${String(i + 1).padStart(2, "0")}`,
);

export function isMissionCode(code: string): boolean {
  return MISSION_CODES.includes(code.toUpperCase());
}

export function expectedCodeForStep(stepOrder: number): string {
  return `WK${String(stepOrder).padStart(2, "0")}`;
}

export function floorLabel(stepOrder: number): "1층" | "2층" {
  return stepOrder <= 5 ? "1층" : "2층";
}
