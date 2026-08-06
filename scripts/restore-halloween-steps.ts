/**
 * 할로윈 퀴즈를 mission-data(확정 백업) 기준으로 DB에 강제 복구합니다.
 * 실행: npx tsx scripts/restore-halloween-steps.ts
 */
import { PrismaClient } from "@prisma/client";
import { MISSION_STEPS_SEED, seedStepToDb } from "../src/lib/halloween/mission-data";

const prisma = new PrismaClient();

async function main() {
  for (const step of MISSION_STEPS_SEED) {
    const data = seedStepToDb(step);
    await prisma.halloweenStep.upsert({
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
    console.log("ok", step.stepOrder, data.answer);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
