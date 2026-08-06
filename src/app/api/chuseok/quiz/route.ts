import { NextResponse } from "next/server";
import { afterQuizCorrect, currentQuizStep } from "@/lib/chuseok/progress";
import { answersMatch } from "@/lib/chuseok/quiz-normalize";
import {
  ensureDevice,
  getMissionStepByOrder,
  getOrCreateMissionProgress,
} from "@/lib/chuseok/db";
import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { chuseokQuizBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = chuseokQuizBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { deviceId, answer } = parsed.data;

  await ensureDevice(deviceId);
  const progress = await getOrCreateMissionProgress(deviceId);

  if (!progress.orderedMode) {
    return NextResponse.json(
      {
        error: "unordered_mode",
        message: "순서 모드가 아니에요. 미션 QR만 찾아 주세요!",
      },
      { status: 400 },
    );
  }

  if (progress.phase !== "quiz") {
    return NextResponse.json(
      { error: "not_quiz_phase", message: "지금은 QR을 찾을 차례예요!" },
      { status: 400 },
    );
  }

  const quizStep = currentQuizStep({
    orderedMode: progress.orderedMode,
    quizzesPassed: progress.quizzesPassed,
    phase: progress.phase as "quiz" | "scan",
    awaitingScanCode: progress.awaitingScanCode,
  });

  if (quizStep === null) {
    return NextResponse.json(
      { error: "no_quiz", message: "풀 퀴즈가 없어요." },
      { status: 400 },
    );
  }

  const step = await getMissionStepByOrder(quizStep);
  if (!step) {
    return NextResponse.json({ error: "step_not_found" }, { status: 500 });
  }

  if (!answersMatch(answer, step.answer)) {
    return NextResponse.json({
      status: "wrong",
      message: "틀렸어요. 다시 생각해 보세요!",
    });
  }

  const newState = afterQuizCorrect(
    {
      orderedMode: progress.orderedMode,
      quizzesPassed: progress.quizzesPassed,
      phase: progress.phase as "quiz" | "scan",
      awaitingScanCode: progress.awaitingScanCode,
    },
    quizStep,
  );

  await prisma.missionProgress.update({
    where: { id: progress.id },
    data: {
      quizzesPassed: newState.quizzesPassed,
      phase: newState.phase,
      awaitingScanCode: newState.awaitingScanCode,
    },
  });

  return NextResponse.json({
    status: "correct",
    message: `다음 보물미션 위치는 ${step.locationHint} 입니다.`,
    locationHint: step.locationHint,
    awaitingScanCode: newState.awaitingScanCode,
  });
}
