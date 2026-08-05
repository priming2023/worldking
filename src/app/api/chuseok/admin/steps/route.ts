import { NextResponse } from "next/server";
import { answerToDisplay, serializeAnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { expectedCodeForStep } from "@/lib/chuseok/codes";
import { prisma } from "@/lib/prisma";
import { chuseokStepUpdateSchema } from "@/lib/validation";

export async function GET() {
  const steps = await prisma.missionStep.findMany({
    orderBy: { stepOrder: "asc" },
  });
  return NextResponse.json({ steps });
}

export async function PUT(request: Request) {
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
