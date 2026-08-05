import { NextResponse } from "next/server";
import { z } from "zod";
import { parseAnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { currentQuizStep } from "@/lib/chuseok/progress";
import { estimateReward } from "@/lib/chuseok/reward";
import {
  ensureDevice,
  getMissionScans,
  getMissionSteps,
  getOrCreateMissionProgress,
} from "@/lib/chuseok/db";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";
import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  deviceId: z.string().uuid(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    deviceId: searchParams.get("deviceId") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_device" }, { status: 400 });
  }
  const { deviceId } = parsed.data;
  const scanDateKst = kstTodayString();

  await ensureDevice(deviceId);
  const progress = await getOrCreateMissionProgress(deviceId);
  const scans = await getMissionScans(deviceId, scanDateKst);
  const steps = await getMissionSteps();

  const foundCodes = scans.map((s) => s.code);
  const claim = await prisma.missionClaim.findUnique({
    where: { deviceId_claimDateKst: { deviceId, claimDateKst: scanDateKst } },
  });

  const reward = estimateReward(progress.orderedMode, scans, progress.quizzesPassed);

  const quizStepNum = currentQuizStep({
    orderedMode: progress.orderedMode,
    quizzesPassed: progress.quizzesPassed,
    phase: progress.phase as "quiz" | "scan",
    awaitingScanCode: progress.awaitingScanCode,
  });

  let currentQuiz = null;
  if (quizStepNum !== null) {
    const step = steps.find((s) => s.stepOrder === quizStepNum);
    if (step) {
      currentQuiz = {
        stepOrder: step.stepOrder,
        question: step.question,
        answerDisplay: parseAnswerDisplay(step.answerDisplay),
      };
    }
  }

  let locationHint: string | null = null;
  if (progress.phase === "scan" && progress.awaitingScanCode) {
    const stepOrder = progress.quizzesPassed;
    const step = steps.find((s) => s.stepOrder === stepOrder);
    locationHint = step?.locationHint ?? null;
  }

  const missionComplete =
    scans.length >= MISSION_TOTAL &&
    progress.quizzesPassed >= MISSION_TOTAL;

  return NextResponse.json({
    foundCount: scans.length,
    foundCodes,
    claimedToday: Boolean(claim),
    todayClaim: claim
      ? { coinAmount: claim.coinAmount, rewardMode: claim.rewardMode }
      : null,
    orderedMode: progress.orderedMode,
    quizzesPassed: progress.quizzesPassed,
    phase: progress.phase,
    awaitingScanCode: progress.awaitingScanCode,
    currentQuiz,
    locationHint,
    expectedCoins: reward.coins,
    rewardMode: reward.mode,
    canClaim: reward.canClaim && !claim,
    missionComplete,
  });
}
