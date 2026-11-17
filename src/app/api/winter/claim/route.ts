import { NextResponse } from "next/server";
import { WINTER_INSTAGRAM_URL } from "@/lib/winter/constants";
import { ensureDevice, getOrCreateWinterProgress, getWinterScans } from "@/lib/winter/db";
import { estimateWinterReward } from "@/lib/winter/reward";
import { isValidWinterStaffPin } from "@/lib/winter/staff-pin";
import { kstTodayDisplay, kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { winterClaimBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = winterClaimBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { deviceId, staffPin } = parsed.data;

  if (!isValidWinterStaffPin(staffPin)) {
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
  let progress = await getOrCreateWinterProgress(deviceId);

  const now = new Date();
  if (
    progress.status === "playing" &&
    progress.endsAt &&
    now.getTime() > progress.endsAt.getTime()
  ) {
    progress = await prisma.winterProgress.update({
      where: { id: progress.id },
      data: { status: "finished", finishReason: "timeout" },
    });
  }

  if (progress.status !== "finished") {
    return NextResponse.json(
      {
        error: "not_finished",
        message: "게임을 먼저 종료한 뒤 코인을 받을 수 있어요.",
      },
      { status: 400 },
    );
  }

  const existing = await prisma.winterClaim.findUnique({
    where: { deviceId_claimDateKst: { deviceId, claimDateKst } },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "already_claimed_today",
        message: "오늘은 이미 코인을 받았어요. 어린이 1명당 1회만 참여할 수 있어요.",
      },
      { status: 409 },
    );
  }

  const scans = await getWinterScans(deviceId, claimDateKst);
  const reward = estimateWinterReward(scans.length);
  if (!reward.canClaim) {
    return NextResponse.json(
      {
        error: "not_ready",
        message: "보물을 1개 이상 찾아야 코인을 받을 수 있어요.",
        foundCount: scans.length,
      },
      { status: 400 },
    );
  }

  const timeLimitMin = progress.timeLimitMin ?? 0;
  const finishReason = progress.finishReason ?? "early";

  const claim = await prisma.winterClaim.create({
    data: {
      deviceId,
      claimDateKst,
      coinAmount: reward.coins,
      timeLimitMin,
      finishReason,
    },
  });

  return NextResponse.json({
    ok: true,
    coinAmount: claim.coinAmount,
    timeLimitMin: claim.timeLimitMin,
    finishReason: claim.finishReason,
    dateKst: claim.claimDateKst,
    dateDisplay: kstTodayDisplay(),
    praise: `❄️ ${claim.coinAmount}코인을 받았어요! 새해 복 많이 받아요!`,
    instagramUrl: WINTER_INSTAGRAM_URL,
  });
}
