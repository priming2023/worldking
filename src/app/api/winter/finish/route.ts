import { NextResponse } from "next/server";
import { finishWinterGame } from "@/lib/winter/play";
import { winterFinishBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = winterFinishBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await finishWinterGame(parsed.data.deviceId, parsed.data.finishReason);
  return NextResponse.json(result.body, { status: result.status });
}
