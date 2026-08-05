"use client";

import Link from "next/link";
import { useState } from "react";
import { ChuseokProgressBar } from "@/components/chuseok/ChuseokProgressBar";
import { QuizInput } from "@/components/chuseok/QuizInput";
import { useChuseokMe } from "@/hooks/chuseok/useChuseokMe";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

type ChuseokHomeProps = {
  deviceId: string;
};

export function ChuseokHome({ deviceId }: ChuseokHomeProps) {
  const { data, loading, error, refresh } = useChuseokMe(deviceId);
  const [quizMsg, setQuizMsg] = useState<string | null>(null);
  const [quizErr, setQuizErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const handleQuizSubmit = async (answer: string) => {
    setSubmitting(true);
    setQuizMsg(null);
    setQuizErr(null);
    try {
      const res = await fetch("/api/chuseok/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, answer }),
      });
      const json = (await res.json()) as {
        status?: string;
        message?: string;
      };
      if (json.status === "correct") {
        setQuizMsg(json.message ?? "정답!");
        await refresh();
      } else {
        setQuizErr(json.message ?? "틀렸어요.");
      }
    } catch {
      setQuizErr("네트워크 오류");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-chuseok-burgundy" role="status">
          준비하고 있어요…
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-10">
        <p className="text-red-700">{error}</p>
        <button type="button" onClick={() => void refresh()} className="chuseok-btn-primary rounded-xl px-4 py-2">
          다시 시도
        </button>
      </main>
    );
  }

  const count = data?.foundCount ?? 0;
  const expectedCoins = data?.expectedCoins ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 pb-10">
      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-chuseok-gold">
          2026 추석 특별 미션
        </p>
        <h1 className="chuseok-title mt-2 text-3xl font-extrabold text-chuseok-burgundy sm:text-4xl">
          추석 QR 보물미션
        </h1>
        <p className="mt-3 text-lg font-semibold text-chuseok-burgundy/90">
          예상 코인{" "}
          <span className="tabular-nums text-2xl font-extrabold text-chuseok-gold">
            {expectedCoins}
          </span>
          개
          {data?.orderedMode && count < MISSION_TOTAL && (
            <span className="ml-1 text-sm font-medium text-chuseok-burgundy/70">
              (순서대로 완료 시 20!)
            </span>
          )}
        </p>
        <div className="mx-auto mt-5 max-w-md">
          <ChuseokProgressBar found={count} total={MISSION_TOTAL} />
        </div>
      </header>

      {showIntro && (
        <section className="chuseok-card rounded-3xl p-5">
          <h2 className="text-lg font-extrabold text-chuseok-burgundy">게임 설명</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-chuseok-burgundy/90">
            <li>· 추석·민속놀이 퀴즈를 맞히면 보물 QR 위치를 알려줘요.</li>
            <li>· QR 10개를 <strong>순서대로</strong> 찾으면 <strong>20코인</strong>!</li>
            <li>· 순서 상관없이 10개를 찾으면 <strong>10코인</strong>.</li>
            <li>· 순서를 어기면 찾은 개수만큼 코인을 받아요.</li>
            <li>· 코인은 카운터에서 하루 1회 받을 수 있어요.</li>
          </ul>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="chuseok-btn-primary mt-4 w-full rounded-2xl py-3 text-base font-extrabold"
          >
            시작하기
          </button>
        </section>
      )}

      {!showIntro && data?.phase === "scan" && data.locationHint && (
        <section className="chuseok-card-highlight rounded-3xl p-5 text-center">
          <p className="text-sm font-bold text-chuseok-gold">보물 위치 안내</p>
          <p className="mt-2 text-xl font-extrabold text-chuseok-burgundy">
            {data.locationHint}
          </p>
          <Link
            href="/chuseok/scan"
            className="chuseok-btn-primary mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl text-lg font-extrabold"
          >
            QR 스캔하기
          </Link>
        </section>
      )}

      {!showIntro && data?.phase === "quiz" && data.currentQuiz && (
        <section className="chuseok-card rounded-3xl p-5">
          <p className="text-sm font-bold text-chuseok-gold">
            퀴즈 {data.currentQuiz.stepOrder}
          </p>
          <h2 className="mt-2 text-lg font-extrabold leading-snug text-chuseok-burgundy">
            {data.currentQuiz.question}
          </h2>
          <div className="mt-5">
            <QuizInput
              display={data.currentQuiz.answerDisplay}
              onSubmit={handleQuizSubmit}
              disabled={submitting}
            />
          </div>
          {quizMsg && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-800" role="status">
              {quizMsg}
            </p>
          )}
          {quizErr && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-800" role="alert">
              {quizErr}
            </p>
          )}
        </section>
      )}

      {!showIntro && data?.phase === "quiz" && !data.currentQuiz && data.missionComplete && (
        <section className="chuseok-card-highlight rounded-3xl p-5 text-center">
          <p className="text-xl font-extrabold text-chuseok-burgundy">모든 보물을 찾았어요!</p>
          <Link href="/chuseok/complete" className="chuseok-btn-primary mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl font-extrabold">
            완료 화면
          </Link>
        </section>
      )}

      <nav className="flex flex-col gap-3">
        <Link
          href="/chuseok/scan"
          className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-chuseok-gold/50 bg-white/90 text-lg font-extrabold text-chuseok-burgundy shadow-sm"
        >
          QR 스캔
        </Link>
        {data?.canClaim && (
          <Link
            href="/chuseok/claim"
            className="chuseok-btn-primary flex min-h-14 items-center justify-center rounded-2xl text-lg font-extrabold"
          >
            코인 받기 ({expectedCoins}개)
          </Link>
        )}
        {data?.claimedToday && (
          <p className="text-center text-sm font-semibold text-chuseok-burgundy/70">
            오늘 코인을 받았어요 ({data.todayClaim?.coinAmount}개)
          </p>
        )}
      </nav>
    </main>
  );
}
