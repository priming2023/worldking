/** 직원 확인 PIN — 카운터에서 코인 수령 확정용 */
export function getWinterStaffPin(): string {
  const winter = process.env.WINTER_STAFF_PIN?.trim();
  if (winter && winter.length > 0) return winter;
  const halloween = process.env.HALLOWEEN_STAFF_PIN?.trim();
  if (halloween && halloween.length > 0) return halloween;
  const shared = process.env.CHUSEOK_STAFF_PIN?.trim();
  if (shared && shared.length > 0) return shared;
  return "1001";
}

export function isValidWinterStaffPin(pin: string): boolean {
  return pin.trim() === getWinterStaffPin();
}
