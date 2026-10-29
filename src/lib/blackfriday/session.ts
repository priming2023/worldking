import { MISSION_TOTAL } from "@/lib/blackfriday/codes";
import { ensureDevice, getOrCreateProgress, getScans, getSteps } from "@/lib/blackfriday/db";
import { quizView } from "@/lib/blackfriday/play";
import { currentQuizStep } from "@/lib/blackfriday/progress";
import { estimateReward } from "@/lib/blackfriday/reward";
import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export async function loadBlackfridaySession(deviceId: string) {
  await ensureDevice(deviceId);
  const scanDateKst = kstTodayString();
  const progress = await getOrCreateProgress(deviceId);
  const scans = await getScans(deviceId, scanDateKst);
  const steps = await getSteps();
  const claim = await prisma.blackfridayClaim.findUnique({
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
  let revealAnswer: string | null = null;
  if (quizStepNum !== null) {
    const step = steps.find((item) => item.stepOrder === quizStepNum);
    if (step) {
      currentQuiz = quizView(step);
      if (progress.quizWrongCount >= 3) revealAnswer = step.answer;
    }
  }

  let locationHint: string | null = null;
  if (progress.orderedMode && progress.phase === "scan" && progress.awaitingScanCode) {
    const step = steps.find((item) => item.stepOrder === progress.quizzesPassed);
    locationHint = step?.locationHint ?? null;
  }

  return {
    foundCount: scans.length,
    total: MISSION_TOTAL,
    quizzesPassed: progress.quizzesPassed,
    orderedMode: progress.orderedMode,
    phase: progress.phase,
    awaitingScanCode: progress.awaitingScanCode,
    quizWrongCount: progress.quizWrongCount,
    currentQuiz,
    revealAnswer,
    locationHint,
    missionComplete: scans.length >= MISSION_TOTAL,
    expectedCoins: reward.coins,
    rewardMode: reward.mode,
    canClaim: reward.canClaim && !claim,
    claimedToday: Boolean(claim),
    todayClaim: claim ? { coinAmount: claim.coinAmount, rewardMode: claim.rewardMode } : null,
  };
}
