import { expectedCodeForStep, MISSION_TOTAL } from "@/lib/blackfriday/codes";

export type MissionPhase = "quiz" | "scan";

export type ProgressState = {
  orderedMode: boolean;
  quizzesPassed: number;
  phase: MissionPhase;
  awaitingScanCode: string | null;
};

export function afterQuizCorrect(state: ProgressState, stepOrder: number): ProgressState {
  return {
    ...state,
    quizzesPassed: stepOrder,
    phase: "scan",
    awaitingScanCode: expectedCodeForStep(stepOrder),
  };
}

export function afterCorrectScan(state: ProgressState): ProgressState {
  return {
    ...state,
    phase: "quiz",
    awaitingScanCode: null,
  };
}

export function switchToUnordered(state: ProgressState): ProgressState {
  return {
    ...state,
    orderedMode: false,
    phase: "scan",
    awaitingScanCode: null,
  };
}

export function currentQuizStep(state: ProgressState): number | null {
  if (!state.orderedMode) return null;
  if (state.phase !== "quiz") return null;
  const next = state.quizzesPassed + 1;
  if (next > MISSION_TOTAL) return null;
  return next;
}
