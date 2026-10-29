"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlackfridayHeader } from "@/components/blackfriday/BlackfridayHeader";
import { QrCameraScanner } from "@/components/scan/QrCameraScanner";
import { useBlackfridayDeviceId } from "@/hooks/blackfriday/useBlackfridayDeviceId";

type Session = {
  phase: string;
  locationHint: string | null;
  awaitingScanCode: string | null;
  foundCount: number;
  quizzesPassed: number;
};

export function BlackfridayScanClient() {
  const deviceId = useBlackfridayDeviceId();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!deviceId) return;
    const res = await fetch(`/api/blackfriday/me?deviceId=${deviceId}`);
    if (!res.ok) return;
    const data = (await res.json()) as Session & { missionComplete?: boolean };
    if (data.missionComplete) {
      router.replace("/blackfriday/complete");
      return;
    }
    if (data.phase !== "scan") {
      router.replace("/blackfriday");
      return;
    }
    setSession(data);
  }, [deviceId, router]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onDecoded(text: string) {
    if (!deviceId || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/blackfriday/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, qrPayload: text }),
      });
      const data = (await res.json()) as { status?: string; message?: string; missionComplete?: boolean };
      if (data.status === "new" && data.missionComplete) {
        router.replace("/blackfriday/complete");
        return;
      }
      if (data.status === "new") {
        router.replace("/blackfriday");
        return;
      }
      setMessage(data.message ?? "다시 스캔해 주세요.");
      window.setTimeout(() => setBusy(false), 1200);
    } catch {
      setMessage("스캔을 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-3">
      <BlackfridayHeader
        progress={session ? `${Math.max(session.foundCount, session.quizzesPassed)}/10` : undefined}
      />
      {session?.locationHint ? (
        <p className="mt-2 text-center text-sm leading-snug text-[#E8C170]">{session.locationHint}</p>
      ) : null}
      <div className="mt-3">
        <QrCameraScanner
          active={!busy}
          frameClassName="ring-[#E8C170]"
          onDecoded={(text) => void onDecoded(text)}
        />
      </div>
      {message ? <p className="mt-2 text-center text-sm text-[#E8C170]">{message}</p> : null}
      <Link href="/blackfriday" className="mt-3 text-center text-sm text-white/70 underline">
        문제로 돌아가기
      </Link>
    </main>
  );
}
