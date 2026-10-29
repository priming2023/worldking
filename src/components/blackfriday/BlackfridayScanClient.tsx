"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlackfridayHeader } from "@/components/blackfriday/BlackfridayHeader";
import { BlackfridayQuizPanel } from "@/components/blackfriday/BlackfridayQuizPanel";
import { QrCameraScanner } from "@/components/scan/QrCameraScanner";
import { useBlackfridayDeviceId } from "@/hooks/blackfriday/useBlackfridayDeviceId";

type Quiz = {
  stepOrder: number;
  question: string;
  answerDisplay: string[][];
  hint: string;
  numeric: boolean;
};

type Session = {
  phase: string;
  orderedMode: boolean;
  locationHint: string | null;
  foundCount: number;
  quizzesPassed: number;
  currentQuiz: Quiz | null;
  revealAnswer: string | null;
  quizWrongCount: number;
  missionComplete: boolean;
  canClaim: boolean;
};

export function BlackfridayScanClient() {
  const deviceId = useBlackfridayDeviceId();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState("");
  const [orderText, setOrderText] = useState("");
  const [pendingCode, setPendingCode] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!deviceId) return null;
    const res = await fetch(`/api/blackfriday/me?deviceId=${deviceId}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Session;
    setSession(data);
    if (data.missionComplete) router.replace("/blackfriday/complete");
    return data;
  }, [deviceId, router]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function postScan(text: string, confirmOutOfOrder = false) {
    if (!deviceId || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/blackfriday/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, qrPayload: text, confirmOutOfOrder }),
      });
      const data = (await res.json()) as { status?: string; message?: string; missionComplete?: boolean };
      if (data.status === "order_warning") {
        setPendingCode(text);
        setOrderText(data.message ?? "순서를 어길까요?");
        return;
      }
      setOrderText("");
      setPendingCode("");
      if (data.status === "new" && data.missionComplete) {
        router.replace("/blackfriday/complete");
        return;
      }
      if (data.status === "new") {
        setNotice("보물을 찾았어요!");
        await reload();
        return;
      }
      setNotice(data.message ?? "다시 스캔해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function postQuiz(body: { answer?: string; skip?: boolean }) {
    if (!deviceId || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/blackfriday/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, ...body }),
      });
      const data = (await res.json()) as { status?: string; message?: string };
      if (data.status === "wrong" || data.status === "reveal") setNotice(data.message ?? "");
      if (data.status === "correct") setNotice(data.message ?? "");
      await reload();
    } finally {
      setBusy(false);
    }
  }

  const inQuiz = Boolean(session?.orderedMode && session.phase === "quiz" && session.currentQuiz);
  const showCamera = Boolean(session) && !inQuiz;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-3">
      <BlackfridayHeader
        progress={session ? `${Math.max(session.foundCount, session.quizzesPassed)}/10` : undefined}
      />
      {inQuiz && session?.currentQuiz ? (
        <BlackfridayQuizPanel
          quiz={session.currentQuiz}
          revealAnswer={session.revealAnswer}
          wrongCount={session.quizWrongCount}
          busy={busy}
          notice={notice}
          onSubmit={postQuiz}
        />
      ) : null}
      {showCamera && session?.locationHint ? (
        <p className="mt-2 text-center text-sm leading-snug text-[#E8C170]">{session.locationHint}</p>
      ) : null}
      {showCamera && session && !session.orderedMode ? (
        <p className="mt-2 text-center text-sm text-white/80">순서 없이 QR을 찾아 주세요. 퀴즈는 더 없어요.</p>
      ) : null}
      <div className={showCamera ? "relative mt-3" : "pointer-events-none absolute h-px w-px overflow-hidden opacity-0"}>
        <QrCameraScanner
          active
          frameClassName="ring-[#E8C170]"
          onDecoded={(text) => {
            if (!showCamera || orderText) return;
            void postScan(text);
          }}
        />
      </div>
      {showCamera && notice ? <p className="mt-2 text-center text-sm text-[#E8C170]">{notice}</p> : null}
      {session?.canClaim ? (
        <Link href="/blackfriday/claim" className="mt-3 rounded-xl bg-[#E8C170] py-3 text-center font-bold text-black">
          코인 받기
        </Link>
      ) : null}
      <Link href="/blackfriday" className="mt-3 text-center text-sm text-white/70 underline">
        홈으로
      </Link>
      {orderText ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 px-4 pb-8">
          <div className="w-full max-w-sm rounded-2xl border border-[#E8C170]/50 bg-black p-5">
            <p className="whitespace-pre-line text-sm leading-relaxed">{orderText}</p>
            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-[#E8C170] py-3 font-bold text-black"
              onClick={() => void postScan(pendingCode, true)}
            >
              순서 없이 찾을게요
            </button>
            <button type="button" className="mt-2 w-full py-2 text-sm text-white/70" onClick={() => setOrderText("")}>
              계속 순서대로
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
