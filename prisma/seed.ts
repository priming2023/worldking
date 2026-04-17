import { PrismaClient } from "@prisma/client";
import { TREASURE_CODES } from "../src/lib/treasure-codes";

const prisma = new PrismaClient();

async function main() {
  for (const code of TREASURE_CODES) {
    await prisma.treasureQr.upsert({
      where: { code },
      create: { code },
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
