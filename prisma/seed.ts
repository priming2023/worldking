import { PrismaClient } from "@prisma/client";
import { TREASURE_CODES } from "../src/lib/treasure-codes";
import { MISSION_STEPS_SEED, seedStepToDb } from "../src/lib/chuseok/mission-data";

const prisma = new PrismaClient();

async function main() {
  for (const code of TREASURE_CODES) {
    await prisma.treasureQr.upsert({
      where: { code },
      create: { code },
      update: {},
    });
  }

  for (const step of MISSION_STEPS_SEED) {
    const data = seedStepToDb(step);
    await prisma.missionStep.upsert({
      where: { stepOrder: step.stepOrder },
      create: data,
      update: {
        question: data.question,
        answer: data.answer,
        answerDisplay: data.answerDisplay,
        locationHint: data.locationHint,
        qrCode: data.qrCode,
      },
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
