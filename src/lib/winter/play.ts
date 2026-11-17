import { isWinterCode } from "@/lib/winter/codes";
import { ensureDevice, getOrCreateWinterProgress, getWinterScans } from "@/lib/winter/db";
import { estimateWinterReward } from "@/lib/winter/reward";
import { isWinterTimeLimit } from "@/lib/winter/time-options";
import { parseTreasureCode } from "@/lib/qr";
import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import type { WinterFinishReason } from "@/lib/winter/session";

export async function startWinterGame(deviceId: string, timeLimitMin: number, now = new Date()) {
  if (!isWinterTimeLimit(timeLimitMin)) {
    return {
      status: 400 as const,
      body: { error: "invalid_time", message: "돌림판 시간이 올바르지 않아요." },
    };
  }

  await ensureDevice(deviceId);
  const progress = await getOrCreateWinterProgress(deviceId);

  if (progress.status === "playing" || progress.status === "finished") {
    return {
      status: 409 as const,
      body: {
        error: "already_started",
        message: "오늘은 이미 게임을 시작했어요.",
        status: progress.status,
      },
    };
  }

  const endsAt = new Date(now.getTime() + timeLimitMin * 60 * 1000);
  const updated = await prisma.winterProgress.update({
    where: { id: progress.id },
    data: {
      timeLimitMin,
      startedAt: now,
      endsAt,
      status: "playing",
      finishReason: null,
    },
  });

  return {
    status: 200 as const,
    body: {
      ok: true,
      timeLimitMin: updated.timeLimitMin,
      startedAt: updated.startedAt?.toISOString() ?? null,
      endsAt: updated.endsAt?.toISOString() ?? null,
      remainingMs: timeLimitMin * 60 * 1000,
    },
  };
}

export async function finishWinterGame(
  deviceId: string,
  finishReason: WinterFinishReason,
  now = new Date(),
) {
  await ensureDevice(deviceId);
  let progress = await getOrCreateWinterProgress(deviceId);

  if (progress.status === "idle") {
    return {
      status: 400 as const,
      body: { error: "not_started", message: "아직 게임을 시작하지 않았어요." },
    };
  }

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

  if (progress.status === "finished") {
    const scans = await getWinterScans(deviceId, kstTodayString(now));
    return {
      status: 200 as const,
      body: {
        ok: true,
        alreadyFinished: true,
        finishReason: progress.finishReason,
        foundCount: scans.length,
        expectedCoins: estimateWinterReward(scans.length).coins,
      },
    };
  }

  const updated = await prisma.winterProgress.update({
    where: { id: progress.id },
    data: { status: "finished", finishReason },
  });
  const scans = await getWinterScans(deviceId, kstTodayString(now));

  return {
    status: 200 as const,
    body: {
      ok: true,
      alreadyFinished: false,
      finishReason: updated.finishReason,
      foundCount: scans.length,
      expectedCoins: estimateWinterReward(scans.length).coins,
    },
  };
}

export async function submitWinterScan(
  deviceId: string,
  qrPayload: string,
  now = new Date(),
) {
  const code = parseTreasureCode(qrPayload);
  if (!code || !isWinterCode(code)) {
    return {
      status: 200 as const,
      body: {
        status: "unknown_qr",
        message: "월드킹 보물 QR(WK01~WK20)이 아니에요.",
      },
    };
  }

  await ensureDevice(deviceId);
  let progress = await getOrCreateWinterProgress(deviceId);
  const scanDateKst = kstTodayString(now);

  if (progress.status === "idle") {
    return {
      status: 400 as const,
      body: { error: "not_started", message: "돌림판으로 시간을 정한 뒤 시작해 주세요." },
    };
  }

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

  if (progress.status === "finished") {
    return {
      status: 400 as const,
      body: {
        error: "finished",
        message: "시간이 끝났어요. 찾은 만큼 코인을 받아 주세요!",
        finishReason: progress.finishReason,
      },
    };
  }

  const existing = await prisma.winterScan.findUnique({
    where: { deviceId_code_scanDateKst: { deviceId, code, scanDateKst } },
  });
  if (existing) {
    return {
      status: 200 as const,
      body: { status: "duplicate", code, message: "이미 찾은 보물이에요!" },
    };
  }

  const prevCount = await prisma.winterScan.count({ where: { deviceId, scanDateKst } });
  await prisma.winterScan.create({
    data: {
      deviceId,
      code,
      scanDateKst,
      sequenceIndex: prevCount + 1,
    },
  });

  const foundCount = prevCount + 1;
  return {
    status: 200 as const,
    body: {
      status: "ok",
      code,
      foundCount,
      message: "보물을 찾았어요!",
    },
  };
}
