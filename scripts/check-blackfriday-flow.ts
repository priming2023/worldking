import { expectedCodeForStep } from "../src/lib/blackfriday/codes";
import { BLACKFRIDAY_STEPS_SEED } from "../src/lib/blackfriday/mission-data";
import { isDigitDisplay, submitBlackfridayQuiz } from "../src/lib/blackfriday/play";
import { submitBlackfridayScan } from "../src/lib/blackfriday/play-scan";
import { estimateReward } from "../src/lib/blackfriday/reward";
import { loadBlackfridaySession } from "../src/lib/blackfriday/session";
import { WRONG_MESSAGE } from "../src/lib/blackfriday/play";
import { prisma } from "../src/lib/prisma";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const rows = await prisma.blackfridayStep.findMany({ orderBy: { stepOrder: "asc" } });
  assert(rows.length === 10, `steps ${rows.length}`);
  const numericOrders = new Set([2, 3, 4, 5, 7, 8]);
  for (const seed of BLACKFRIDAY_STEPS_SEED) {
    const row = rows.find((item) => item.stepOrder === seed.stepOrder);
    assert(row?.answer === seed.answer, `answer ${seed.stepOrder}`);
    assert(row?.hint === seed.hint, `hint ${seed.stepOrder}`);
    assert(row?.locationHint === seed.locationHint, `location ${seed.stepOrder} ${row?.locationHint}`);
    assert(row?.qrCode === expectedCodeForStep(seed.stepOrder), `code ${seed.stepOrder}`);
    assert(isDigitDisplay(seed.answerDisplay) === numericOrders.has(seed.stepOrder), `pad ${seed.stepOrder}`);
  }

  const deviceId = crypto.randomUUID();
  for (let order = 1; order <= 10; order += 1) {
    const seed = BLACKFRIDAY_STEPS_SEED[order - 1];
    const quiz = await submitBlackfridayQuiz(deviceId, { answer: seed.answer });
    assert(quiz.body.status === "correct", `quiz ${order} ${JSON.stringify(quiz.body)}`);
    const scan = await submitBlackfridayScan(deviceId, `worldking:${expectedCodeForStep(order)}`);
    assert(scan.body.status === "new", `scan ${order} ${JSON.stringify(scan.body)}`);
    assert(Boolean(scan.body.missionComplete) === (order === 10), `complete flag ${order}`);
  }
  const done = await loadBlackfridaySession(deviceId);
  assert(done.missionComplete && done.foundCount === 10 && done.expectedCoins === 20, "session complete");
  assert(done.canClaim && done.rewardMode === "ordered", "ordered claim");
  const perfect = Array.from({ length: 10 }, (_, index) => ({
    code: `WK${String(index + 1).padStart(2, "0")}`,
    sequenceIndex: index + 1,
  }));
  assert(estimateReward(false, perfect, 10).coins === 10, "unordered 10");
  assert(estimateReward(true, perfect.slice(0, 5), 5).coins === 5, "partial 5");
  assert(estimateReward(true, perfect.slice(0, 4), 4).canClaim === false, "under 5");

  const wrongId = crypto.randomUUID();
  for (let i = 1; i <= 2; i += 1) {
    const wrong = await submitBlackfridayQuiz(wrongId, { answer: "오답" });
    assert(wrong.body.status === "wrong" && wrong.body.message === WRONG_MESSAGE, `wrong ${i}`);
  }
  const revealed = await submitBlackfridayQuiz(wrongId, { answer: "오답" });
  assert(revealed.body.status === "reveal" && revealed.body.answer === "당진", "reveal");
  const skipped = await submitBlackfridayQuiz(wrongId, { skip: true });
  assert(skipped.body.status === "correct", "skip");
  const wrongPlace = await submitBlackfridayScan(wrongId, "worldking:WK05");
  assert(wrongPlace.body.status === "order_warning", "order warning");
  const confirmed = await submitBlackfridayScan(wrongId, "worldking:WK05", true);
  assert(confirmed.body.status === "new" && confirmed.body.orderedMode === false, "unordered scan");
  const rightPlace = await submitBlackfridayScan(wrongId, "worldking:WK01");
  assert(rightPlace.body.status === "new", "wk01");

  const { POST } = await import("../src/app/api/blackfriday/claim/route");
  const claimRes = await POST(
    new Request("http://local/api/blackfriday/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, staffPin: "1001" }),
    }),
  );
  const claimBody = (await claimRes.json()) as { coinAmount?: number };
  assert(claimRes.status === 200 && claimBody.coinAmount === 20, "staff claim 20");
  const again = await POST(
    new Request("http://local/api/blackfriday/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, staffPin: "1001" }),
    }),
  );
  assert(again.status === 409, "once per day");

  await prisma.blackfridayClaim.deleteMany({ where: { deviceId: { in: [deviceId, wrongId] } } });
  await prisma.blackfridayScan.deleteMany({ where: { deviceId: { in: [deviceId, wrongId] } } });
  await prisma.blackfridayProgress.deleteMany({ where: { deviceId: { in: [deviceId, wrongId] } } });
  await prisma.device.deleteMany({ where: { id: { in: [deviceId, wrongId] } } });
  console.log("blackfriday flow ok");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
