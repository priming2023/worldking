import { NextResponse } from "next/server";
import { submitBlackfridayQuiz } from "@/lib/blackfriday/play";
import { blackfridayQuizBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = blackfridayQuizBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const result = await submitBlackfridayQuiz(parsed.data.deviceId, {
    answer: parsed.data.answer,
    skip: parsed.data.skip,
  });
  return NextResponse.json(result.body, { status: result.status });
}
