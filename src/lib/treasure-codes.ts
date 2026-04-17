/** 보물 QR 코드 (DB 시드와 동일) */
export const TREASURE_TOTAL = 20;

export const TREASURE_CODES: readonly string[] = Array.from(
  { length: TREASURE_TOTAL },
  (_, i) => `WK${String(i + 1).padStart(2, "0")}`,
);

/** QR에 인쇄할 페이로드 — 스캐너가 읽는 문자열 */
export function treasurePayload(code: string): string {
  return `worldking:${code}`;
}
