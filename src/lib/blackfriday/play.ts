import { Prisma } from "@prisma/client";
import { parseAnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { afterCorrectScan, afterQuizCorrect, currentQuizStep } from "@/lib/blackfriday/progress";
import type { ProgressState } from "@/lib/blackfriday/progress";
import { answersMatch } from "@/lib/chuseok/quiz-normalize";
import { isMissionCode, MISSION_TOTAL } from "@/lib/blackfriday/codes";
import {
  ensureDevice,
  getOrCreateProgress,
  getScans,
  getStepByOrder,
  getSteps,
} from "@/lib/blackfriday/db";
import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { parseTreasureCode } from "@/lib/qr";

export const WRONG_MESSAGE = "아쉬워요! 다시 한 번 해볼까요?";
const REVEAL_AFTER = 3;

function stateOf(progress: {
  quizzesPassed: number;
  phase: string;
  awaitingScanCode: string | null;
}): ProgressState {
  return {
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

export async function submitBlackfridayScan(deviceId: string, qrPayload: string) {
  const code = parseTreasureCode(qrPayload);
  if (!code || !isMissionCode(code)) {
    return {
      status: 400 as const,
      body: { error: "unknown_qr", message: "월드킹 보물 QR(WK01~WK10)이 아니에요." },
    };
  }

  await ensureDevice(deviceId);
  const scanDateKst = kstTodayString();
  const progress = await getOrCreateProgress(deviceId);

  const already = await prisma.blackfridayScan.findFirst({
    where: { deviceId, code, scanDateKst },
  });
  if (already) {
    return { status: 200 as const, body: { status: "duplicate", code, message: "이미 찾은 보물이에요!" } };
  }

  if (progress.phase !== "scan" || !progress.awaitingScanCode) {
    return { status: 200 as const, body: { status: "wait_quiz", message: "지금은 문제를 먼저 풀어 주세요!" } };
  }

  if (code !== progress.awaitingScanCode) {
    const steps = await getSteps();
    const expected = steps.find((item) => item.qrCode === progress.awaitingScanCode);
    const hint = expected?.locationHint ?? progress.awaitingScanCode;
    return {
      status: 200 as const,
      body: {
        status: "wrong_place",
        message: `지금은 ${hint} 의 ${progress.awaitingScanCode} QR을 찾아 주세요!`,
      },
    };
  }

  const scans = await getScans(deviceId, scanDateKst);
  try {
    await prisma.blackfridayScan.create({
      data: { deviceId, code, scanDateKst, sequenceIndex: scans.length + 1 },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: 200 as const, body: { status: "duplicate", code, message: "이미 찾은 보물이에요!" } };
    }
    throw error;
  }

  const next = afterCorrectScan(stateOf(progress));
  await prisma.blackfridayProgress.update({
    where: { id: progress.id },
    data: { phase: next.phase, awaitingScanCode: next.awaitingScanCode, quizWrongCount: 0 },
  });

  const foundCount = scans.length + 1;
  return {
    status: 200 as const,
    body: { status: "new", code, foundCount, missionComplete: foundCount >= MISSION_TOTAL },
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
