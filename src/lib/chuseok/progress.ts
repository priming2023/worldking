import { expectedCodeForStep } from "@/lib/chuseok/codes";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

export type MissionPhase = "quiz" | "scan";

export type ProgressState = {
  orderedMode: boolean;
  quizzesPassed: number;
  phase: MissionPhase;
  awaitingScanCode: string | null;
};

/** 퀴즈 정답 후: 위치 안내 → 스캔 대기 */
export function afterQuizCorrect(state: ProgressState, stepOrder: number): ProgressState {
  return {
    ...state,
    quizzesPassed: stepOrder,
    phase: "scan",
    awaitingScanCode: expectedCodeForStep(stepOrder),
  };
}

/** 올바른 QR 스캔 후: 다음 퀴즈로 */
export function afterCorrectScan(state: ProgressState): ProgressState {
  const nextQuiz = state.quizzesPassed + 1;
  if (nextQuiz > MISSION_TOTAL) {
    return {
      ...state,
      phase: "quiz",
      awaitingScanCode: null,
    };
  }
  return {
    ...state,
    phase: "quiz",
    awaitingScanCode: null,
  };
}

/** 무순서 모드 전환 */
export function switchToUnordered(state: ProgressState): ProgressState {
  return { ...state, orderedMode: false };
}

/** 첫 스캔이 퀴즈 없이 — 무순서 모드 (경고 없음) */
export function startUnorderedFromScan(state: ProgressState): ProgressState {
  return { ...state, orderedMode: false };
}

export function isMissionComplete(quizzesPassed: number, scanCount: number): boolean {
  return scanCount >= MISSION_TOTAL;
}

export function currentQuizStep(state: ProgressState): number | null {
  if (state.phase !== "quiz") return null;
  const next = state.quizzesPassed + 1;
  if (next > MISSION_TOTAL) return null;
  return next;
}
