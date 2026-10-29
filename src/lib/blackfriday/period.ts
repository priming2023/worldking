import { kstTodayString } from "@/lib/kst";

/** 2026-11-20(금) ~ 2026-11-29(일), KST 날짜 기준 */
export const BLACKFRIDAY_START = "2026-11-20";
export const BLACKFRIDAY_END = "2026-11-29";

export function isBlackfridayOpen(now = new Date()): boolean {
  const day = kstTodayString(now);
  return day >= BLACKFRIDAY_START && day <= BLACKFRIDAY_END;
}
