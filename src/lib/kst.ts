/** 오늘 날짜를 Asia/Seoul 기준 YYYY-MM-DD로 반환 */
export function kstTodayString(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 표시용 한국어 날짜 (예: 2026년 4월 17일) */
export function kstTodayDisplay(now = new Date()): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);
}
