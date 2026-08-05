import { NextResponse } from "next/server";
import { answerToDisplay, serializeAnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { expectedCodeForStep } from "@/lib/chuseok/codes";
import { prisma } from "@/lib/prisma";
import { chuseokAdminAuthSchema, chuseokStepUpdateSchema } from "@/lib/validation";

function checkAdmin(request: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const auth = request.headers.get("x-admin-password");
  return auth === password;
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const steps = await prisma.missionStep.findMany({
    orderBy: { stepOrder: "asc" },
  });
  return NextResponse.json({ steps });
}

export async function PUT(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = chuseokStepUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { stepOrder, question, answer, answerDisplay, locationHint } = parsed.data;

  let displayJson = answerDisplay;
  try {
    JSON.parse(answerDisplay);
  } catch {
    displayJson = serializeAnswerDisplay(answerToDisplay(answer));
  }

  const step = await prisma.missionStep.upsert({
    where: { stepOrder },
    create: {
      stepOrder,
      question,
      answer,
      answerDisplay: displayJson,
      locationHint,
      qrCode: expectedCodeForStep(stepOrder),
    },
    update: {
      question,
      answer,
      answerDisplay: displayJson,
      locationHint,
      qrCode: expectedCodeForStep(stepOrder),
    },
  });

  return NextResponse.json({ ok: true, step });
}

/** 비밀번호 확인 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = chuseokAdminAuthSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const password = process.env.ADMIN_PASSWORD;
  if (!password || parsed.data.password !== password) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
