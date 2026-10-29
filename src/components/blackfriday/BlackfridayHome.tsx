"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlackfridayHeader } from "@/components/blackfriday/BlackfridayHeader";
import { BlackfridayIntro } from "@/components/blackfriday/BlackfridayIntro";
import { BlackfridayQuizPanel } from "@/components/blackfriday/BlackfridayQuizPanel";
import { useBlackfridayDeviceId } from "@/hooks/blackfriday/useBlackfridayDeviceId";

type Quiz = {
  stepOrder: number;
  question: string;
  answerDisplay: string[][];
  hint: string;
  numeric: boolean;
};

type Session = {
  foundCount: number;
  total: number;
  quizzesPassed: number;
  orderedMode: boolean;
  phase: string;
  currentQuiz: Quiz | null;
  revealAnswer: string | null;
  locationHint: string | null;
  missionComplete: boolean;
  quizWrongCount: number;
  canClaim: boolean;
  expectedCoins: number;
};

export function BlackfridayHome() {
  const deviceId = useBlackfridayDeviceId();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const reload = useCallback(async () => {
    if (!deviceId) return;
    const res = await fetch(`/api/blackfriday/me?deviceId=${deviceId}`);
    if (!res.ok) return;
    const data = (await res.json()) as Session;
    setSession(data);
    if (data.quizzesPassed > 0 || data.foundCount > 0 || data.phase === "scan" || !data.orderedMode) {
      setShowIntro(false);
    }
    if (data.missionComplete) router.replace("/blackfriday/complete");
  }, [deviceId, router]);

  useEffect(() => {
    void reload();
  }, [reload]);

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
      if (data.status === "wrong" || data.status === "reveal") {
        setMessage(data.message ?? "");
        await reload();
        return;
      }
      if (data.status === "correct") {
        setMessage("");
        router.push("/blackfriday/scan");
        return;
      }
      setMessage(data.message ?? "다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return <p className="px-4 py-8 text-center text-sm text-[#E8C170]">불러오는 중…</p>;
  }

  const quiz = session.currentQuiz;
  const introVisible = showIntro && session.quizzesPassed === 0 && session.foundCount === 0 && session.orderedMode;
  const progress = quiz
    ? `${quiz.stepOrder}/10`
    : `${Math.max(session.foundCount, session.quizzesPassed)}/10`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-3">
      <BlackfridayHeader progress={introVisible ? undefined : progress} />
      {session.orderedMode && session.foundCount < 10 ? (
        <p className="mt-2 text-center text-sm text-white/80">
          예상 코인 <span className="font-bold text-[#E8C170]">{session.expectedCoins}</span>개
          <span className="ml-1">(순서대로면 20코인!)</span>
        </p>
      ) : null}

      {introVisible ? <BlackfridayIntro onStart={() => setShowIntro(false)} /> : null}

      {!introVisible && session.phase === "scan" && session.locationHint ? (
        <section className="mt-4 flex flex-1 flex-col justify-center gap-4 text-center">
          <p className="text-sm text-white/80">다음 QR은 여기에 있어요</p>
          <p className="text-lg font-bold leading-snug text-[#E8C170]">{session.locationHint}</p>
          <Link
            href="/blackfriday/scan"
            className="rounded-xl bg-[#E8C170] px-4 py-3 text-center text-base font-bold text-black"
          >
            QR 스캔하기
          </Link>
        </section>
      ) : null}

      {!introVisible && quiz ? (
        <BlackfridayQuizPanel
          quiz={quiz}
          revealAnswer={session.revealAnswer}
          wrongCount={session.quizWrongCount}
          busy={busy}
          notice={message}
          onSubmit={postQuiz}
        />
      ) : null}
      {!introVisible && session.orderedMode && quiz ? (
        <Link href="/blackfriday/scan?free=1" className="mt-3 text-center text-sm text-[#E8C170] underline">
          QR만 찾기 (x2 찬스 포기)
        </Link>
      ) : null}
      {!session.orderedMode ? (
        <p className="mt-4 text-center text-sm text-white/80">순서 없이 QR을 찾고 있어요. 퀴즈는 더 없어요.</p>
      ) : null}
      {session.canClaim ? (
        <Link href="/blackfriday/claim" className="mt-4 rounded-xl bg-[#E8C170] py-3 text-center font-bold text-black">
          코인 받기
        </Link>
      ) : null}
    </main>
  );
}
