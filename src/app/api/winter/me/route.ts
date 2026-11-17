import { NextResponse } from "next/server";
import { z } from "zod";
import { loadWinterSession } from "@/lib/winter/session";

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

  const session = await loadWinterSession(parsed.data.deviceId);
  return NextResponse.json(session);
}
