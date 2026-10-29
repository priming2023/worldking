import { NextResponse } from "next/server";
import { submitBlackfridayScan } from "@/lib/blackfriday/play";
import { blackfridayScanBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = blackfridayScanBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const result = await submitBlackfridayScan(parsed.data.deviceId, parsed.data.qrPayload);
  return NextResponse.json(result.body, { status: result.status });
}
