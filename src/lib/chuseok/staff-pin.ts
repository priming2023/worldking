/** 직원 확인 PIN — 카운터에서 코인 수령 확정용 */
export function getChuseokStaffPin(): string {
  const fromEnv = process.env.CHUSEOK_STAFF_PIN?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : "1001";
}

export function isValidChuseokStaffPin(pin: string): boolean {
  return pin.trim() === getChuseokStaffPin();
}
