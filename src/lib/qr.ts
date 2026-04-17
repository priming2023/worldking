/** QR에 인쇄할 값 예: `worldking:WK05` 또는 URL 안에 WK05 포함 */
export function parseTreasureCode(raw: string): string | null {
  const upper = raw.trim().toUpperCase();
  const m = upper.match(/\bWK(0[1-9]|1[0-9]|20)\b/);
  return m ? m[0] : null;
}
