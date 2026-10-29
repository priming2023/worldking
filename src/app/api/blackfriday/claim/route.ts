import { NextResponse } from "next/server";
import { getOrCreateProgress, getScans, ensureDevice } from "@/lib/blackfriday/db";
import { estimateReward } from "@/lib/blackfriday/reward";
import { isValidBlackfridayStaffPin } from "@/lib/blackfriday/staff-pin";
import { kstTodayDisplay, kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { blackfridayClaimBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = blackfridayClaimBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { deviceId, staffPin } = parsed.data;

  if (!isValidBlackfridayStaffPin(staffPin)) {
    return NextResponse.json(
      { error: "invalid_staff_pin", message: "직원 비밀번호가 틀렸어요. 다시 입력해 주세요." },
      { status: 401 },
    );
  }

  const claimDateKst = kstTodayString();
  await ensureDevice(deviceId);
  const progress = await getOrCreateProgress(deviceId);
  const existing = await prisma.blackfridayClaim.findUnique({
    where: { deviceId_claimDateKst: { deviceId, claimDateKst } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "already_claimed_today", message: "오늘은 이미 코인을 받았어요. 내일 또 와 주세요!" },
      { status: 409 },
    );
  }

  const scans = await getScans(deviceId, claimDateKst);
  const reward = estimateReward(progress.orderedMode, scans, progress.quizzesPassed);
  if (!reward.canClaim) {
    return NextResponse.json(
      { error: "not_ready", message: "보물을 5개 이상 찾으면 코인을 받을 수 있어요.", foundCount: scans.length },
      { status: 400 },
    );
  }

  const claim = await prisma.blackfridayClaim.create({
    data: { deviceId, claimDateKst, coinAmount: reward.coins, rewardMode: reward.mode },
  });

  return NextResponse.json({
    ok: true,
    coinAmount: claim.coinAmount,
    rewardMode: claim.rewardMode,
    dateKst: claim.claimDateKst,
    dateDisplay: kstTodayDisplay(),
  });
}
