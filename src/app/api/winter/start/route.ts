import { NextResponse } from "next/server";
import { startWinterGame } from "@/lib/winter/play";
import { winterStartBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = winterStartBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await startWinterGame(parsed.data.deviceId, parsed.data.timeLimitMin);
  return NextResponse.json(result.body, { status: result.status });
}
