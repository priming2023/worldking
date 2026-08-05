/** 정답 비교: 공백 제거, 대소문자 무시 */
export function normalizeAnswer(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toLowerCase();
}

export function answersMatch(userInput: string, correctAnswer: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(correctAnswer);
}
