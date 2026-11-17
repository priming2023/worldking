import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export async function ensureDevice(deviceId: string) {
  await prisma.device.upsert({
    where: { id: deviceId },
    create: { id: deviceId },
    update: {},
  });
}

export async function getOrCreateWinterProgress(deviceId: string) {
  const scanDateKst = kstTodayString();
  return prisma.winterProgress.upsert({
    where: { deviceId_scanDateKst: { deviceId, scanDateKst } },
    create: { deviceId, scanDateKst },
    update: {},
  });
}

export async function getWinterScans(deviceId: string, scanDateKst: string) {
  return prisma.winterScan.findMany({
    where: { deviceId, scanDateKst },
    orderBy: { sequenceIndex: "asc" },
  });
}
