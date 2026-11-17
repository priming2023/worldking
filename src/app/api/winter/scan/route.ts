import { NextResponse } from "next/server";
import { submitWinterScan } from "@/lib/winter/play";
import { winterScanBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = winterScanBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await submitWinterScan(parsed.data.deviceId, parsed.data.qrPayload);
  return NextResponse.json(result.body, { status: result.status });
}
