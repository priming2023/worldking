import { MISSION_TOTAL } from "@/lib/blackfriday/codes";
import { ensureDevice, getOrCreateProgress, getScans, getSteps } from "@/lib/blackfriday/db";
import { quizView } from "@/lib/blackfriday/play";
import { currentQuizStep } from "@/lib/blackfriday/progress";
import { kstTodayString } from "@/lib/kst";

export async function loadBlackfridaySession(deviceId: string) {
  await ensureDevice(deviceId);
  const scanDateKst = kstTodayString();
  const progress = await getOrCreateProgress(deviceId);
  const scans = await getScans(deviceId, scanDateKst);
  const steps = await getSteps();

  const quizStepNum = currentQuizStep({
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
  if (progress.phase === "scan" && progress.awaitingScanCode) {
    const step = steps.find((item) => item.stepOrder === progress.quizzesPassed);
    locationHint = step?.locationHint ?? null;
  }

  return {
    foundCount: scans.length,
    total: MISSION_TOTAL,
    quizzesPassed: progress.quizzesPassed,
    phase: progress.phase,
    awaitingScanCode: progress.awaitingScanCode,
    quizWrongCount: progress.quizWrongCount,
    currentQuiz,
    revealAnswer,
    locationHint,
    missionComplete: scans.length >= MISSION_TOTAL,
    coins: 20,
  };
}
