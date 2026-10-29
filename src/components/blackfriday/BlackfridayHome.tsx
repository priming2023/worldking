"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlackfridayHeader } from "@/components/blackfriday/BlackfridayHeader";
import { QuizAnswerField } from "@/components/quiz/QuizAnswerField";
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
  phase: string;
  currentQuiz: Quiz | null;
  revealAnswer: string | null;
  locationHint: string | null;
  missionComplete: boolean;
  quizWrongCount: number;
};

export function BlackfridayHome() {
  const deviceId = useBlackfridayDeviceId();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!deviceId) return;
    const res = await fetch(`/api/blackfriday/me?deviceId=${deviceId}`);
    if (!res.ok) return;
    const data = (await res.json()) as Session;
    setSession(data);
    if (data.missionComplete) router.replace("/blackfriday/complete");
  }, [deviceId, router]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setHintOpen(false);
    setMessage("");
  }, [session?.currentQuiz?.stepOrder, session?.phase]);

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
        await reload();
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
  const progress = quiz
    ? `${quiz.stepOrder}/10`
    : `${Math.max(session.foundCount, session.quizzesPassed)}/10`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-3">
      <BlackfridayHeader progress={progress} />

      {session.phase === "scan" && session.locationHint ? (
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

      {quiz ? (
        <section className="mt-3 flex flex-1 flex-col rounded-2xl border border-[#E8C170]/30 px-3 py-3">
          <h1 className="text-base font-bold leading-snug">{quiz.question}</h1>
          <div className="mt-3">
            <QuizAnswerField
              key={`${quiz.stepOrder}-${session.quizWrongCount >= 3 ? "reveal" : "play"}`}
              theme="blackfriday"
              display={quiz.answerDisplay}
              numeric={quiz.numeric}
              compact
              disabled={busy || Boolean(session.revealAnswer)}
              countLabel={quiz.numeric ? "숫자" : undefined}
              onSubmit={(answer) => void postQuiz({ answer })}
            />
          </div>
          <button
            type="button"
            className="mt-2 self-start rounded-full border border-[#E8C170]/70 px-3 py-1 text-sm text-[#E8C170]"
            onClick={() => setHintOpen((open) => !open)}
          >
            힌트 보기
          </button>
          {hintOpen ? <p className="mt-1 text-sm text-white/85">{quiz.hint}</p> : null}
          {message && !session.revealAnswer ? (
            <p className="mt-2 text-sm text-[#E8C170]">{message}</p>
          ) : null}
          {session.revealAnswer ? (
            <div className="mt-3 rounded-xl border border-[#E8C170]/50 px-3 py-3 text-center">
              <p className="text-sm">정답은 {session.revealAnswer} 이에요</p>
              <button
                type="button"
                disabled={busy}
                className="mt-2 w-full rounded-xl bg-[#E8C170] py-2.5 text-sm font-bold text-black disabled:opacity-50"
                onClick={() => void postQuiz({ skip: true })}
              >
                다음으로
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
