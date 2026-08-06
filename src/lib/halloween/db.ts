import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export async function ensureDevice(deviceId: string) {
  await prisma.device.upsert({
    where: { id: deviceId },
    create: { id: deviceId },
    update: {},
  });
}

export async function getOrCreateMissionProgress(deviceId: string) {
  const scanDateKst = kstTodayString();
  return prisma.halloweenProgress.upsert({
    where: { deviceId_scanDateKst: { deviceId, scanDateKst } },
    create: { deviceId, scanDateKst },
    update: {},
  });
}

export async function getMissionScans(deviceId: string, scanDateKst: string) {
  return prisma.halloweenScan.findMany({
    where: { deviceId, scanDateKst },
    orderBy: { sequenceIndex: "asc" },
  });
}

export async function getMissionSteps() {
  return prisma.halloweenStep.findMany({ orderBy: { stepOrder: "asc" } });
}

export async function getMissionStepByOrder(stepOrder: number) {
  return prisma.halloweenStep.findUnique({ where: { stepOrder } });
}
