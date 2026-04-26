import { NextResponse } from "next/server";
import { kstTodayDisplay, kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { claimBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = claimBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { deviceId } = parsed.data;
  const claimDateKst = kstTodayString();

  await prisma.device.upsert({
    where: { id: deviceId },
    create: { id: deviceId },
    update: {},
  });

  const existing = await prisma.claim.findUnique({
    where: {
      deviceId_claimDateKst: { deviceId, claimDateKst },
    },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "already_claimed_today",
        message: "오늘은 이미 선물을 받았어요. 내일 또 와 주세요!",
      },
      { status: 409 },
    );
  }

  const foundCount = await prisma.scan.count({
    where: { deviceId, scanDateKst: claimDateKst },
  });
  if (foundCount < 10) {
    return NextResponse.json(
      {
        error: "not_enough",
        message: "보물을 10개 이상 찾아야 선물을 받을 수 있어요.",
        foundCount,
      },
      { status: 400 },
    );
  }

  const claim = await prisma.claim.create({
    data: {
      deviceId,
      claimDateKst,
      countAtClaim: foundCount,
    },
  });

  return NextResponse.json({
    ok: true,
    dateKst: claim.claimDateKst,
    dateDisplay: kstTodayDisplay(),
    count: claim.countAtClaim,
    praise: `${claim.countAtClaim}개 찾았어요. 정말 대단해요!`,
  });
}
