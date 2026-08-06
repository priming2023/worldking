import { NextResponse } from "next/server";
import { estimateReward } from "@/lib/halloween/reward";
import { isValidHalloweenStaffPin } from "@/lib/halloween/staff-pin";
import {
  ensureDevice,
  getMissionScans,
  getOrCreateMissionProgress,
} from "@/lib/halloween/db";
import { kstTodayDisplay, kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { halloweenClaimBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = halloweenClaimBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { deviceId, staffPin } = parsed.data;

  if (!isValidHalloweenStaffPin(staffPin)) {
    return NextResponse.json(
      {
        error: "invalid_staff_pin",
        message: "직원 비밀번호가 틀렸어요. 다시 입력해 주세요.",
      },
      { status: 401 },
    );
  }

  const claimDateKst = kstTodayString();

  await ensureDevice(deviceId);
  const progress = await getOrCreateMissionProgress(deviceId);

  const existing = await prisma.halloweenClaim.findUnique({
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
            ? "보물을 5개 이상 찾으면 카운터에서 코인을 받을 수 있어요. 순서대로 모두 찾으면 20코인!"
            : "보물을 5개 이상 찾아야 코인을 받을 수 있어요.",
        foundCount: scans.length,
        expectedCoins: reward.coins,
      },
      { status: 400 },
    );
  }

  const claim = await prisma.halloweenClaim.create({
    data: {
      deviceId,
      claimDateKst,
      coinAmount: reward.coins,
      rewardMode: reward.mode,
    },
  });

  const praise =
    reward.mode === "ordered"
      ? "🎃 순서대로 10개를 모두 찾았어요! 20코인 정말 대단해요! 🎉"
      : reward.mode === "unordered"
        ? "🎊 보물 10개를 모두 찾았어요! 10코인 축하해요! 👻"
        : `🪙 ${reward.coins}코인을 받았어요! 카운터에서 받아 가세요!`;

  return NextResponse.json({
    ok: true,
    coinAmount: claim.coinAmount,
    rewardMode: claim.rewardMode,
    dateKst: claim.claimDateKst,
    dateDisplay: kstTodayDisplay(),
    praise,
  });
}
