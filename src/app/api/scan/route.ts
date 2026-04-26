import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { kstTodayString } from "@/lib/kst";
import { parseTreasureCode } from "@/lib/qr";
import { prisma } from "@/lib/prisma";
import { scanBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = scanBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { deviceId, qrPayload } = parsed.data;

  const code = parseTreasureCode(qrPayload);
  if (!code) {
    return NextResponse.json(
      { error: "unknown_qr", message: "등록되지 않은 QR이에요." },
      { status: 400 },
    );
  }

  const treasure = await prisma.treasureQr.findUnique({ where: { code } });
  if (!treasure) {
    return NextResponse.json(
      { error: "unknown_qr", message: "등록되지 않은 QR이에요." },
      { status: 400 },
    );
  }

  await prisma.device.upsert({
    where: { id: deviceId },
    create: { id: deviceId },
    update: {},
  });

  const scanDateKst = kstTodayString();
  const already = await prisma.scan.findFirst({
    where: { deviceId, code, scanDateKst },
    select: { id: true },
  });
  if (already) {
    return NextResponse.json(
      { status: "duplicate", code, message: "이미 찾은 보물이에요!" },
      { status: 200 },
    );
  }

  try {
    await prisma.scan.create({
      data: { deviceId, code, scanDateKst },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { status: "duplicate", code, message: "이미 찾은 보물이에요!" },
        { status: 200 },
      );
    }
    throw e;
  }

  const foundCount = await prisma.scan.count({ where: { deviceId, scanDateKst } });
  return NextResponse.json({
    status: "new",
    code,
    foundCount,
    message: "새 보물을 찾았어요!",
  });
}
