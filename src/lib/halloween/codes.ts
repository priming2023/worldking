/** 할로윈 미션 QR 코드 (WK11~WK20) */
export const MISSION_TOTAL = 10;

export const MISSION_CODES: readonly string[] = Array.from(
  { length: MISSION_TOTAL },
  (_, i) => `WK${String(i + 11).padStart(2, "0")}`,
);

export function isMissionCode(code: string): boolean {
  return MISSION_CODES.includes(code.toUpperCase());
}

/** stepOrder 1→WK11 … 10→WK20 */
export function expectedCodeForStep(stepOrder: number): string {
  return `WK${String(stepOrder + 10).padStart(2, "0")}`;
}
