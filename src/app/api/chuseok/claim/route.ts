import { NextResponse } from "next/server";
import { estimateReward } from "@/lib/chuseok/reward";
import {
  ensureDevice,
  getMissionScans,
  getOrCreateMissionProgress,
} from "@/lib/chuseok/db";
import { kstTodayDisplay, kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { chuseokDeviceSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = chuseokDeviceSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { deviceId } = parsed.data;
  const claimDateKst = kstTodayString();

  await ensureDevice(deviceId);
  const progress = await getOrCreateMissionProgress(deviceId);

  const existing = await prisma.missionClaim.findUnique({
    where: { deviceId_claimDateKst: { deviceId, claimDateKst } },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "already_claimed_today",
        message: "오늘은 이미 코인을 받았어요. 내일 또 와 주세요!",
      },
      { status: 409 },
    );
  }

  const scans = await getMissionScans(deviceId, claimDateKst);
  const reward = estimateReward(progress.orderedMode, scans, progress.quizzesPassed);

  if (!reward.canClaim) {
    return NextResponse.json(
      {
        error: "not_ready",
        message:
          reward.mode === "in_progress"
            ? "순서대로 미션을 완료하면 20코인을 받을 수 있어요!"
            : "아직 받을 코인이 없어요.",
        foundCount: scans.length,
        expectedCoins: reward.coins,
      },
      { status: 400 },
    );
  }

  const claim = await prisma.missionClaim.create({
    data: {
      deviceId,
      claimDateKst,
      coinAmount: reward.coins,
      rewardMode: reward.mode,
    },
  });

  const praise =
    reward.mode === "ordered"
      ? "순서대로 10개를 모두 찾았어요! 20코인 대단해요!"
      : reward.mode === "unordered"
        ? "10개 보물을 모두 찾았어요! 10코인!"
        : `${reward.coins}코인을 받았어요!`;

  return NextResponse.json({
    ok: true,
    coinAmount: claim.coinAmount,
    rewardMode: claim.rewardMode,
    dateKst: claim.claimDateKst,
    dateDisplay: kstTodayDisplay(),
    praise,
  });
}
