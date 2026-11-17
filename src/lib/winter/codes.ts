import { TREASURE_CODES, TREASURE_TOTAL } from "@/lib/treasure-codes";

export const WINTER_TOTAL = TREASURE_TOTAL;
export const WINTER_CODES = TREASURE_CODES;

export function isWinterCode(code: string): boolean {
  return (WINTER_CODES as readonly string[]).includes(code);
}
