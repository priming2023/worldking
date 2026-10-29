import { Prisma } from "@prisma/client";
import { isMissionCode, MISSION_TOTAL } from "@/lib/blackfriday/codes";
import { ensureDevice, getOrCreateProgress, getScans, getSteps } from "@/lib/blackfriday/db";
import { afterCorrectScan, switchToUnordered } from "@/lib/blackfriday/progress";
import type { ProgressState } from "@/lib/blackfriday/progress";
import { estimateReward } from "@/lib/blackfriday/reward";
import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { parseTreasureCode } from "@/lib/qr";

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

export async function submitBlackfridayScan(
  deviceId: string,
  qrPayload: string,
  confirmOutOfOrder = false,
) {
  const code = parseTreasureCode(qrPayload);
  if (!code || !isMissionCode(code)) {
    return {
      status: 400 as const,
      body: { error: "unknown_qr", message: "월드킹 보물 QR(WK01~WK10)이 아니에요." },
    };
  }

  await ensureDevice(deviceId);
  const scanDateKst = kstTodayString();
  let progress = await getOrCreateProgress(deviceId);

  const already = await prisma.blackfridayScan.findFirst({
    where: { deviceId, code, scanDateKst },
  });
  if (already) {
    return { status: 200 as const, body: { status: "duplicate", code, message: "이미 찾은 보물이에요!" } };
  }

  const steps = await getSteps();
  const expected = progress.awaitingScanCode
    ? steps.find((item) => item.qrCode === progress.awaitingScanCode)
    : null;

  if (progress.orderedMode) {
    const scanningBeforeQuiz = progress.quizzesPassed === 0 && progress.phase === "quiz";
    if (scanningBeforeQuiz || progress.phase === "quiz") {
      if (!confirmOutOfOrder) {
        return {
          status: 200 as const,
          body: {
            status: "order_warning",
            message:
              "지금은 문제를 먼저 풀어 주세요!\n\n문제 없이 QR만 스캔하면 20코인 찬스는 사라져요.\n정말 순서 없이 이 QR을 스캔할까요?",
            scannedCode: code,
          },
        };
      }
      const next = switchToUnordered(stateOf(progress));
      progress = await prisma.blackfridayProgress.update({
        where: { id: progress.id },
        data: { orderedMode: false, phase: next.phase, awaitingScanCode: null, quizWrongCount: 0 },
      });
    } else if (progress.phase === "scan" && progress.awaitingScanCode && code !== progress.awaitingScanCode) {
      const hint = expected?.locationHint ?? progress.awaitingScanCode;
      if (!confirmOutOfOrder) {
        return {
          status: 200 as const,
          body: {
            status: "order_warning",
            message: `지금은 ${hint} 의 ${progress.awaitingScanCode} QR을 찾아 주세요!\n\n순서를 어기면 20코인 찬스는 사라져요.\n정말 순서 없이 이 QR을 스캔할까요?`,
            scannedCode: code,
            expectedCode: progress.awaitingScanCode,
            locationHint: hint,
          },
        };
      }
      const next = switchToUnordered(stateOf(progress));
      progress = await prisma.blackfridayProgress.update({
        where: { id: progress.id },
        data: { orderedMode: false, phase: next.phase, awaitingScanCode: null, quizWrongCount: 0 },
      });
    }
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

  if (progress.orderedMode && progress.phase === "scan" && progress.awaitingScanCode === code) {
    const next = afterCorrectScan(stateOf(progress));
    await prisma.blackfridayProgress.update({
      where: { id: progress.id },
      data: { phase: next.phase, awaitingScanCode: next.awaitingScanCode, quizWrongCount: 0 },
    });
  }

  const found = await getScans(deviceId, scanDateKst);
  const updated = await getOrCreateProgress(deviceId);
  const reward = estimateReward(updated.orderedMode, found, updated.quizzesPassed);
  return {
    status: 200 as const,
    body: {
      status: "new",
      code,
      foundCount: found.length,
      missionComplete: found.length >= MISSION_TOTAL,
      orderedMode: updated.orderedMode,
      nextPhase: updated.phase,
      expectedCoins: reward.coins,
      canClaim: reward.canClaim,
    },
  };
}
