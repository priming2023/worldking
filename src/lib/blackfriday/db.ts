import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export async function ensureDevice(deviceId: string) {
  await prisma.device.upsert({
    where: { id: deviceId },
    create: { id: deviceId },
    update: {},
  });
}

export async function getOrCreateProgress(deviceId: string) {
  const scanDateKst = kstTodayString();
  return prisma.blackfridayProgress.upsert({
    where: { deviceId_scanDateKst: { deviceId, scanDateKst } },
    create: { deviceId, scanDateKst },
    update: {},
  });
}

export async function getScans(deviceId: string, scanDateKst: string) {
  return prisma.blackfridayScan.findMany({
    where: { deviceId, scanDateKst },
    orderBy: { sequenceIndex: "asc" },
  });
}

export async function getSteps() {
  return prisma.blackfridayStep.findMany({ orderBy: { stepOrder: "asc" } });
}

export async function getStepByOrder(stepOrder: number) {
  return prisma.blackfridayStep.findUnique({ where: { stepOrder } });
}
