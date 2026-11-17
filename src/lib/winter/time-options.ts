/** 돌림판 10칸 — 5·15분 포함, 균등 확률 */
export const WINTER_TIME_OPTIONS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 15] as const;

export type WinterTimeLimitMin = (typeof WINTER_TIME_OPTIONS)[number];

export function isWinterTimeLimit(value: number): value is WinterTimeLimitMin {
  return (WINTER_TIME_OPTIONS as readonly number[]).includes(value);
}

export function pickWinterTimeLimit(): WinterTimeLimitMin {
  const index = Math.floor(Math.random() * WINTER_TIME_OPTIONS.length);
  return WINTER_TIME_OPTIONS[index]!;
}
