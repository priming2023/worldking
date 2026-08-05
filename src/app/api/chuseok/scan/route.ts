import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { isMissionCode } from "@/lib/chuseok/codes";
import {
  afterCorrectScan,
  startUnorderedFromScan,
  switchToUnordered,
} from "@/lib/chuseok/progress";
import { estimateReward } from "@/lib/chuseok/reward";
import {
  ensureDevice,
  getMissionScans,
  getOrCreateMissionProgress,
} from "@/lib/chuseok/db";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";
import { kstTodayString } from "@/lib/kst";
import { parseTreasureCode } from "@/lib/qr";
import { prisma } from "@/lib/prisma";
import { chuseokScanBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = chuseokScanBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { deviceId, qrPayload, confirmOutOfOrder } = parsed.data;

  const code = parseTreasureCode(qrPayload);
  if (!code || !isMissionCode(code)) {
    return NextResponse.json(
      { error: "unknown_qr", message: "추석 미션 QR(WK01~10)이 아니에요." },
      { status: 400 },
    );
  }

  await ensureDevice(deviceId);
  const scanDateKst = kstTodayString();
  let progress = await getOrCreateMissionProgress(deviceId);

  const already = await prisma.missionScan.findFirst({
    where: { deviceId, code, scanDateKst },
  });
  if (already) {
    return NextResponse.json(
      { status: "duplicate", code, message: "이미 찾은 보물이에요!" },
      { status: 200 },
    );
  }

  const state = {
    orderedMode: progress.orderedMode,
    quizzesPassed: progress.quizzesPassed,
    phase: progress.phase as "quiz" | "scan",
    awaitingScanCode: progress.awaitingScanCode,
  };

  // 순서 검증
  if (progress.orderedMode) {
    const isFirstScanWithoutQuiz =
      progress.quizzesPassed === 0 && progress.phase === "quiz";

    if (isFirstScanWithoutQuiz) {
      // 퀴즈 없이 첫 스캔 → 무순서 모드 (경고 없음)
      const newState = startUnorderedFromScan(state);
      progress = await prisma.missionProgress.update({
        where: { id: progress.id },
        data: { orderedMode: newState.orderedMode },
      });
    } else if (progress.phase === "scan" && progress.awaitingScanCode) {
      if (code !== progress.awaitingScanCode) {
        if (!confirmOutOfOrder) {
          return NextResponse.json({
            status: "order_warning",
            message:
              "순서에 맞지 않게 QR코드를 스캔할 경우 2배 보물미션 대신 찾은 QR코드 갯수만큼 코인을 받게 됩니다. 스캔할까요?",
            scannedCode: code,
            expectedCode: progress.awaitingScanCode,
          });
        }
        const newState = switchToUnordered(state);
        progress = await prisma.missionProgress.update({
          where: { id: progress.id },
          data: { orderedMode: newState.orderedMode },
        });
      }
    } else if (progress.phase === "quiz" && progress.quizzesPassed > 0) {
      // 퀴즈 풀고 스캔 전인데 다른 QR 스캔
      if (!confirmOutOfOrder) {
        return NextResponse.json({
          status: "order_warning",
          message:
            "순서에 맞지 않게 QR코드를 스캔할 경우 2배 보물미션 대신 찾은 QR코드 갯수만큼 코인을 받게 됩니다. 스캔할까요?",
          scannedCode: code,
          expectedCode: null,
        });
      }
      const newState = switchToUnordered(state);
      progress = await prisma.missionProgress.update({
        where: { id: progress.id },
        data: { orderedMode: newState.orderedMode },
      });
    }
  }

  const existingScans = await getMissionScans(deviceId, scanDateKst);
  const sequenceIndex = existingScans.length;

  try {
    await prisma.missionScan.create({
      data: { deviceId, code, scanDateKst, sequenceIndex },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { status: "duplicate", code, message: "이미 찾은 보물이에요!" },
        { status: 200 },
      );
    }
    throw e;
  }

  // 순서 모드에서 올바른 스캔 → 다음 퀴즈
  if (
    progress.orderedMode &&
    progress.phase === "scan" &&
    progress.awaitingScanCode === code
  ) {
    const newState = afterCorrectScan({
      orderedMode: progress.orderedMode,
      quizzesPassed: progress.quizzesPassed,
      phase: progress.phase as "quiz" | "scan",
      awaitingScanCode: progress.awaitingScanCode,
    });
    await prisma.missionProgress.update({
      where: { id: progress.id },
      data: {
        phase: newState.phase,
        awaitingScanCode: newState.awaitingScanCode,
      },
    });
  }

  const scans = await getMissionScans(deviceId, scanDateKst);
  const updatedProgress = await getOrCreateMissionProgress(deviceId);
  const reward = estimateReward(
    updatedProgress.orderedMode,
    scans,
    updatedProgress.quizzesPassed,
  );

  const foundCount = scans.length;
  const missionComplete = foundCount >= MISSION_TOTAL;

  return NextResponse.json({
    status: "new",
    code,
    foundCount,
    message: "새 보물을 찾았어요!",
    orderedMode: updatedProgress.orderedMode,
    expectedCoins: reward.coins,
    missionComplete,
  });
}
