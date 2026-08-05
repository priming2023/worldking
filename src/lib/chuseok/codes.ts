/** 추석 미션에서 사용하는 QR 코드 (WK01~WK10) */
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
