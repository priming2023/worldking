"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChuseokProgressBar } from "@/components/chuseok/ChuseokProgressBar";
import { ChuseokIntro } from "@/components/chuseok/ChuseokIntro";
import { ChuseokUnorderedExplore } from "@/components/chuseok/ChuseokUnorderedExplore";
import { QuizInput } from "@/components/chuseok/QuizInput";
import { useChuseokMe } from "@/hooks/chuseok/useChuseokMe";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

type ChuseokHomeProps = {
  deviceId: string;
};

export function ChuseokHome({ deviceId }: ChuseokHomeProps) {
  const router = useRouter();
  const { data, loading, error, refresh } = useChuseokMe(deviceId);
  const [quizErr, setQuizErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [correctFlash, setCorrectFlash] = useState<string | null>(null);

  // 이미 진행 중이면 인트로 건너뛰고 바로 다음 퀴즈/스캔
  useEffect(() => {
    if (!data) return;
    const started =
      data.quizzesPassed > 0 ||
      data.foundCount > 0 ||
      data.phase === "scan" ||
      data.missionComplete;
    if (started) setShowIntro(false);
  }, [data]);

  const handleQuizSubmit = async (answer: string) => {
    setSubmitting(true);
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
        locationHint?: string;
      };
      if (json.status === "correct") {
        const hint = json.locationHint ?? "";
        setCorrectFlash(json.message ?? `다음 보물미션 위치는 ${hint} 입니다.`);
        await refresh();
        window.setTimeout(() => {
          router.push("/chuseok/scan?auto=1");
        }, 900);
      } else {
        setQuizErr(json.message ?? "틀렸어요. 다시 생각해 보세요!");
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
  const introVisible = showIntro && (data?.quizzesPassed ?? 0) === 0 && count === 0;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 pb-10">
      <header className="text-center">
        <p className="text-sm font-bold tracking-widest text-chuseok-gold">
          🌕 2026 추석 특별 미션
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
              (순서대로면 20코인!)
            </span>
          )}
        </p>
        <div className="mx-auto mt-5 max-w-md">
          <ChuseokProgressBar found={count} total={MISSION_TOTAL} label="미션 보물" />
        </div>
      </header>

      {introVisible && <ChuseokIntro onStart={() => setShowIntro(false)} />}

      {correctFlash && (
        <section className="chuseok-card-highlight rounded-3xl p-5 text-center" role="status">
          <p className="text-sm font-bold text-chuseok-gold">정답이에요!</p>
          <p className="mt-2 text-lg font-extrabold text-chuseok-burgundy">{correctFlash}</p>
          <p className="mt-3 text-sm font-semibold text-chuseok-burgundy/70">
            카메라를 켤게요…
          </p>
        </section>
      )}

      {!introVisible &&
        !correctFlash &&
        data?.orderedMode &&
        data.phase === "scan" &&
        data.locationHint && (
        <section className="chuseok-card-highlight rounded-3xl p-5 text-center">
          <p className="text-sm font-bold text-chuseok-gold">보물 위치</p>
          <p className="mt-2 text-xl font-extrabold text-chuseok-burgundy">
            {data.locationHint}
          </p>
          <Link
            href="/chuseok/scan?auto=1"
            className="chuseok-btn-primary mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl text-lg font-extrabold"
          >
            📷 카메라로 QR 찾기
          </Link>
        </section>
      )}

      {!introVisible &&
        !correctFlash &&
        data?.orderedMode &&
        data.phase === "quiz" &&
        data.currentQuiz && (
        <section className="chuseok-card rounded-3xl p-5">
          <p className="text-sm font-bold text-chuseok-gold">
            퀴즈 {data.currentQuiz.stepOrder} / {MISSION_TOTAL}
          </p>
          <h2 className="mt-2 text-lg font-extrabold leading-snug text-chuseok-burgundy">
            {data.currentQuiz.question}
          </h2>
          <div className="mt-5">
            <QuizInput
              display={data.currentQuiz.answerDisplay}
              onSubmit={handleQuizSubmit}
              disabled={submitting}
              countLabel={
                data.currentQuiz.stepOrder === 3 ? "숫자3개" : undefined
              }
              numeric={data.currentQuiz.stepOrder === 3}
            />
          </div>
          {quizErr && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-800" role="alert">
              {quizErr}
            </p>
          )}
        </section>
      )}

      {!introVisible &&
        !correctFlash &&
        !data?.orderedMode &&
        !data?.missionComplete && <ChuseokUnorderedExplore />}

      {!introVisible && data?.missionComplete && (
        <section className="chuseok-card-highlight rounded-3xl p-5 text-center">
          <p className="text-xl font-extrabold text-chuseok-burgundy">모든 보물을 찾았어요! 🎉</p>
          <Link
            href="/chuseok/complete"
            className="chuseok-btn-primary mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl font-extrabold"
          >
            완료 화면
          </Link>
        </section>
      )}

      <nav className="flex flex-col gap-3">
        {data?.canClaim && (
          <Link
            href="/chuseok/claim"
            className="chuseok-btn-primary flex min-h-14 items-center justify-center rounded-2xl text-lg font-extrabold"
          >
            🪙 코인 받기 ({expectedCoins}개)
          </Link>
        )}
        {data?.orderedMode && !data?.missionComplete && data.phase === "quiz" && (
          <Link
            href="/chuseok/scan?auto=1"
            className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-chuseok-gold/40 bg-white/90 text-base font-bold text-chuseok-burgundy"
          >
            📷 미션 QR만 찾기 (x2 찬스 포기)
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
