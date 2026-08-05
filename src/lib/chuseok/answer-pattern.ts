/** UI 네모칸 패턴: [["송","편"]] 또는 [["윷"],["놀이"]] */
export type AnswerDisplay = string[][];

export function parseAnswerDisplay(json: string): AnswerDisplay {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return fallbackFromAnswer("");
    return parsed.map((group) =>
      Array.isArray(group) ? group.map(String) : [String(group)],
    );
  } catch {
    return [["?"], ["?"]];
  }
}

/** 정답 문자열에서 자동 생성 (띄어쓰기 = 그룹 구분) */
export function answerToDisplay(answer: string): AnswerDisplay {
  return answer.trim().split(/\s+/).map((word) => [...word]);
}

function fallbackFromAnswer(answer: string): AnswerDisplay {
  return answerToDisplay(answer);
}

export function serializeAnswerDisplay(display: AnswerDisplay): string {
  return JSON.stringify(display);
}

/** 패턴의 총 입력 칸 수 */
export function totalBoxCount(display: AnswerDisplay): number {
  return display.reduce((sum, group) => sum + group.length, 0);
}
