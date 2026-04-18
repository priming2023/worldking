import { NextResponse } from "next/server";
import { z } from "zod";
import { kstTodayString } from "@/lib/kst";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  deviceId: z.string().uuid(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    deviceId: searchParams.get("deviceId") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_device" }, { status: 400 });
  }
  const { deviceId } = parsed.data;

  await prisma.device.upsert({
    where: { id: deviceId },
    create: { id: deviceId },
    update: {},
  });

  const foundCount = await prisma.scan.count({ where: { deviceId } });
  const scanRows = await prisma.scan.findMany({
    where: { deviceId },
    select: { code: true },
    distinct: ["code"],
    orderBy: { code: "asc" },
  });
  const foundCodes = scanRows.map((r) => r.code);
  const claimDateKst = kstTodayString();
  const claim = await prisma.claim.findUnique({
    where: {
      deviceId_claimDateKst: { deviceId, claimDateKst },
    },
  });

  return NextResponse.json({
    foundCount,
    foundCodes,
    claimedToday: Boolean(claim),
    todayClaim: claim
      ? { countAtClaim: claim.countAtClaim, claimDateKst: claim.claimDateKst }
      : null,
  });
}
