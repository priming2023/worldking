export function getBlackfridayStaffPin(): string {
  const own = process.env.BLACKFRIDAY_STAFF_PIN?.trim();
  if (own) return own;
  const shared = process.env.CHUSEOK_STAFF_PIN?.trim();
  if (shared) return shared;
  return "1001";
}

export function isValidBlackfridayStaffPin(pin: string): boolean {
  return pin.trim() === getBlackfridayStaffPin();
}
