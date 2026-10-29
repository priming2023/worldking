import { parseAnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { afterQuizCorrect, currentQuizStep } from "@/lib/blackfriday/progress";
import type { ProgressState } from "@/lib/blackfriday/progress";
import { answersMatch } from "@/lib/chuseok/quiz-normalize";
import { ensureDevice, getOrCreateProgress, getStepByOrder } from "@/lib/blackfriday/db";
import { prisma } from "@/lib/prisma";

export const WRONG_MESSAGE = "아쉬워요! 다시 한 번 해볼까요?";
const REVEAL_AFTER = 3;

function stateOf(progress: {
  orderedMode: boolean;
  quizzesPassed: number;
  phase: string;
  awaitingScanCode: string | null;
}): ProgressState {
  return {
    orderedMode: progress.orderedMode,
    quizzesPassed: progress.quizzesPassed,
    phase: progress.phase as ProgressState["phase"],
    awaitingScanCode: progress.awaitingScanCode,
  };
}

export function isDigitDisplay(display: string[][]): boolean {
  const chars = display.flat();
  return chars.length > 0 && chars.every((char) => /^\d$/.test(char));
}

export async function submitBlackfridayQuiz(
  deviceId: string,
  input: { answer?: string; skip?: boolean },
) {
  await ensureDevice(deviceId);
  const progress = await getOrCreateProgress(deviceId);
  if (!progress.orderedMode) {
    return { status: 400 as const, body: { error: "unordered_mode", message: "순서 모드가 아니에요. QR만 찾아 주세요!" } };
  }
  if (progress.phase !== "quiz") {
    return { status: 400 as const, body: { error: "not_quiz_phase", message: "지금은 QR을 찾을 차례예요!" } };
  }

  const quizStep = currentQuizStep(stateOf(progress));
  if (quizStep === null) {
    return { status: 400 as const, body: { error: "no_quiz", message: "풀 문제가 없어요." } };
  }

  const step = await getStepByOrder(quizStep);
  if (!step) return { status: 500 as const, body: { error: "step_not_found" } };

  const canSkip = Boolean(input.skip) && progress.quizWrongCount >= REVEAL_AFTER;
  const matched = !input.skip && Boolean(input.answer) && answersMatch(input.answer ?? "", step.answer);

  if (input.skip && !canSkip) {
    return { status: 400 as const, body: { error: "skip_not_ready", message: "아직 정답을 열 수 없어요." } };
  }

  if (!canSkip && !matched) {
    const wrongCount = progress.quizWrongCount + 1;
    await prisma.blackfridayProgress.update({
      where: { id: progress.id },
      data: { quizWrongCount: wrongCount },
    });
    if (wrongCount >= REVEAL_AFTER) {
      return {
        status: 200 as const,
        body: { status: "reveal", message: WRONG_MESSAGE, answer: step.answer, wrongCount },
      };
    }
    return { status: 200 as const, body: { status: "wrong", message: WRONG_MESSAGE, wrongCount } };
  }

  const next = afterQuizCorrect(stateOf(progress), quizStep);
  await prisma.blackfridayProgress.update({
    where: { id: progress.id },
    data: {
      quizzesPassed: next.quizzesPassed,
      phase: next.phase,
      awaitingScanCode: next.awaitingScanCode,
      quizWrongCount: 0,
    },
  });

  return {
    status: 200 as const,
    body: {
      status: "correct",
      message: `다음 위치는 ${step.locationHint} 예요.`,
      locationHint: step.locationHint,
      awaitingScanCode: next.awaitingScanCode,
    },
  };
}

export function quizView(step: { stepOrder: number; question: string; answerDisplay: string; hint: string }) {
  const answerDisplay = parseAnswerDisplay(step.answerDisplay);
  return {
    stepOrder: step.stepOrder,
    question: step.question,
    answerDisplay,
    hint: step.hint,
    numeric: isDigitDisplay(answerDisplay),
  };
}
