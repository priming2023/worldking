import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { isMissionCode, MISSION_TOTAL } from "@/lib/chuseok/codes";
import {
  afterCorrectScan,
  startUnorderedFromScan,
  switchToUnordered,
} from "@/lib/chuseok/progress";
import { estimateReward } from "@/lib/chuseok/reward";
import {
  ensureDevice,
  getMissionScans,
  getMissionSteps,
  getOrCreateMissionProgress,
} from "@/lib/chuseok/db";
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

  const steps = await getMissionSteps();
  const expectedStep = progress.awaitingScanCode
    ? steps.find((s) => s.qrCode === progress.awaitingScanCode)
    : null;

  // 순서 모드: 퀴즈 정답 후 지정된 QR만 통과
  if (progress.orderedMode) {
    const isFirstScanWithoutQuiz =
      progress.quizzesPassed === 0 && progress.phase === "quiz";

    if (isFirstScanWithoutQuiz) {
      // 퀴즈 없이 스캔 시작 → 무순서 모드
      progress = await prisma.missionProgress.update({
        where: { id: progress.id },
        data: { orderedMode: startUnorderedFromScan(state).orderedMode },
      });
    } else if (progress.phase === "scan" && progress.awaitingScanCode) {
      if (code !== progress.awaitingScanCode) {
        const hint = expectedStep?.locationHint ?? progress.awaitingScanCode;
        if (!confirmOutOfOrder) {
          return NextResponse.json({
            status: "order_warning",
            message: `지금은 ${hint} 의 ${progress.awaitingScanCode} QR을 찾아 주세요!\n\n순서대로 찾지 않으면 20코인 보너스를 받을 수 없어요.\n정말 순서 없이 이 QR을 스캔할까요?`,
            scannedCode: code,
            expectedCode: progress.awaitingScanCode,
            locationHint: expectedStep?.locationHint ?? null,
          });
        }
        // 확인 후 무순서 전환 + 해당 QR 기록
        progress = await prisma.missionProgress.update({
          where: { id: progress.id },
          data: {
            orderedMode: switchToUnordered(state).orderedMode,
            phase: "quiz",
            awaitingScanCode: null,
          },
        });
      }
    } else if (progress.phase === "quiz") {
      // 아직 퀴즈 단계인데 QR을 찍음
      if (!confirmOutOfOrder) {
        return NextResponse.json({
          status: "order_warning",
          message:
            "지금은 퀴즈를 먼저 풀어 주세요!\n\n퀴즈 없이 QR만 스캔하면 20코인 보너스를 받을 수 없어요.\n정말 순서 없이 이 QR을 스캔할까요?",
          scannedCode: code,
          expectedCode: null,
        });
      }
      progress = await prisma.missionProgress.update({
        where: { id: progress.id },
        data: {
          orderedMode: switchToUnordered(state).orderedMode,
          awaitingScanCode: null,
        },
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

  // 올바른 QR(예: 퀴즈1 → WK01) 스캔 시에만 다음 퀴즈로
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
  // 무순서 10개 완주 OR 순서+퀴즈 10개 완주
  const missionComplete = foundCount >= MISSION_TOTAL;

  return NextResponse.json({
    status: "new",
    code,
    foundCount,
    message:
      updatedProgress.orderedMode && updatedProgress.phase === "quiz"
        ? "보물을 찾았어요! 다음 퀴즈로 가요."
        : "새 보물을 찾았어요!",
    orderedMode: updatedProgress.orderedMode,
    expectedCoins: reward.coins,
    missionComplete,
    nextPhase: updatedProgress.phase,
  });
}
