import { PrismaClient } from "@prisma/client";
import { TREASURE_CODES } from "../src/lib/treasure-codes";
import {
  MISSION_STEPS_SEED as CHUSEOK_STEPS,
  seedStepToDb as seedChuseokStep,
} from "../src/lib/chuseok/mission-data";
import {
  MISSION_STEPS_SEED as HALLOWEEN_STEPS,
  seedStepToDb as seedHalloweenStep,
} from "../src/lib/halloween/mission-data";

const prisma = new PrismaClient();

async function main() {
  for (const code of TREASURE_CODES) {
    await prisma.treasureQr.upsert({
      where: { code },
      create: { code },
      update: {},
    });
  }

  // 이미 있는 단계는 덮어쓰지 않음 (관리자 수정 보존)
  for (const step of CHUSEOK_STEPS) {
    const data = seedChuseokStep(step);
    await prisma.missionStep.upsert({
      where: { stepOrder: step.stepOrder },
      create: data,
      update: {},
    });
  }

  for (const step of HALLOWEEN_STEPS) {
    const data = seedHalloweenStep(step);
    await prisma.halloweenStep.upsert({
      where: { stepOrder: step.stepOrder },
      create: data,
      update: {},
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
