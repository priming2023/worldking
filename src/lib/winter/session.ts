import { WINTER_TOTAL } from "@/lib/winter/codes";
import { ensureDevice, getOrCreateWinterProgress, getWinterScans } from "@/lib/winter/db";
import { estimateWinterReward } from "@/lib/winter/reward";
import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export type WinterStatus = "idle" | "playing" | "finished";
export type WinterFinishReason = "early" | "timeout";

export async function loadWinterSession(deviceId: string, now = new Date()) {
  await ensureDevice(deviceId);
  const scanDateKst = kstTodayString(now);
  let progress = await getOrCreateWinterProgress(deviceId);

  // 서버 권한: playing인데 endsAt 지났으면 자동 finished(timeout)
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

  const scans = await getWinterScans(deviceId, scanDateKst);
  const claim = await prisma.winterClaim.findUnique({
    where: { deviceId_claimDateKst: { deviceId, claimDateKst: scanDateKst } },
  });
  const reward = estimateWinterReward(scans.length);

  const endsAtMs = progress.endsAt?.getTime() ?? null;
  const remainingMs =
    progress.status === "playing" && endsAtMs != null
      ? Math.max(0, endsAtMs - now.getTime())
      : progress.status === "finished"
        ? 0
        : null;

  return {
    status: progress.status as WinterStatus,
    finishReason: (progress.finishReason as WinterFinishReason | null) ?? null,
    timeLimitMin: progress.timeLimitMin,
    startedAt: progress.startedAt?.toISOString() ?? null,
    endsAt: progress.endsAt?.toISOString() ?? null,
    remainingMs,
    foundCount: scans.length,
    foundCodes: scans.map((s) => s.code),
    total: WINTER_TOTAL,
    expectedCoins: reward.coins,
    canClaim: reward.canClaim && progress.status === "finished" && !claim,
    claimedToday: Boolean(claim),
    todayClaim: claim
      ? {
          coinAmount: claim.coinAmount,
          timeLimitMin: claim.timeLimitMin,
          finishReason: claim.finishReason,
        }
      : null,
  };
}
