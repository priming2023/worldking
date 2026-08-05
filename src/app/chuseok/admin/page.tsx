"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Step = {
  id: number;
  stepOrder: number;
  question: string;
  answer: string;
  answerDisplay: string;
  locationHint: string;
  qrCode: string;
};

export default function ChuseokAdminPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadSteps = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/chuseok/admin/steps");
      if (!res.ok) {
        setErr("불러오기 실패");
        return;
      }
      const json = (await res.json()) as { steps: Step[] };
      setSteps(json.steps);
    } catch {
      setErr("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSteps();
  }, [loadSteps]);

  const saveStep = async (step: Step) => {
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/chuseok/admin/steps", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepOrder: step.stepOrder,
        question: step.question,
        answer: step.answer,
        answerDisplay: step.answerDisplay,
        locationHint: step.locationHint,
      }),
    });
    if (!res.ok) {
      setErr(`${step.stepOrder}번 저장 실패`);
      return;
    }
    setMsg(`${step.stepOrder}번 저장됨`);
    await loadSteps();
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="chuseok-title text-2xl font-extrabold text-chuseok-burgundy">
          퀴즈·위치 관리
        </h1>
        <Link href="/chuseok" className="text-sm font-bold text-chuseok-burgundy">
          미션 홈
        </Link>
      </div>

      <p className="text-sm text-chuseok-burgundy/70">
        링크를 아는 사람이 바로 수정할 수 있어요. 직원용으로만 공유해 주세요.
      </p>

      {loading && <p className="text-sm">불러오는 중…</p>}
      {msg && <p className="text-sm font-bold text-emerald-700">{msg}</p>}
      {err && <p className="text-sm font-bold text-red-700">{err}</p>}

      <div className="flex flex-col gap-6">
        {steps.map((step, i) => (
          <section key={step.id} className="chuseok-card rounded-2xl p-4">
            <h2 className="font-extrabold text-chuseok-burgundy">
              {step.stepOrder}번 · {step.qrCode}
            </h2>
            <label className="mt-3 block text-xs font-bold text-chuseok-burgundy/80">
              문제
              <textarea
                value={step.question}
                onChange={(e) => updateStep(i, "question", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              />
            </label>
            <label className="mt-2 block text-xs font-bold text-chuseok-burgundy/80">
              정답
              <input
                value={step.answer}
                onChange={(e) => updateStep(i, "answer", e.target.value)}
                className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              />
            </label>
            <label className="mt-2 block text-xs font-bold text-chuseok-burgundy/80">
              칸 패턴 (JSON)
              <input
                value={step.answerDisplay}
                onChange={(e) => updateStep(i, "answerDisplay", e.target.value)}
                className="mt-1 w-full rounded-lg border px-2 py-1 font-mono text-xs"
              />
            </label>
            <label className="mt-2 block text-xs font-bold text-chuseok-burgundy/80">
              위치 힌트
              <input
                value={step.locationHint}
                onChange={(e) => updateStep(i, "locationHint", e.target.value)}
                className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => void saveStep(step)}
              className="chuseok-btn-primary mt-3 rounded-xl px-4 py-2 text-sm font-bold"
            >
              저장
            </button>
          </section>
        ))}
      </div>
    </main>
  );
}
