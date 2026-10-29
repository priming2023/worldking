"use client";

import { useEffect, useState } from "react";
import { BlackfridayHeader } from "@/components/blackfriday/BlackfridayHeader";
import { floorLabel } from "@/lib/blackfriday/codes";

type StepDraft = {
  stepOrder: number;
  question: string;
  answer: string;
  answerDisplay: string;
  locationHint: string;
  hint: string;
  qrCode: string;
};

export function BlackfridayAdmin() {
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/blackfriday/admin/steps")
      .then((res) => res.json())
      .then((data: { steps: StepDraft[] }) => setSteps(data.steps ?? []));
  }, []);

  function update(order: number, patch: Partial<StepDraft>) {
    setSteps((prev) => prev.map((step) => (step.stepOrder === order ? { ...step, ...patch } : step)));
  }

  async function save(step: StepDraft) {
    setMessage("");
    const res = await fetch("/api/blackfriday/admin/steps", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepOrder: step.stepOrder,
        question: step.question,
        answer: step.answer,
        answerDisplay: step.answerDisplay,
        locationHint: step.locationHint,
        hint: step.hint,
      }),
    });
    setMessage(res.ok ? `${step.stepOrder}번을 저장했어요.` : `${step.stepOrder}번 저장에 실패했어요.`);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <BlackfridayHeader />
      <h1 className="mt-4 text-xl font-bold text-[#E8C170]">블랙프라이데이 문제 관리</h1>
      <p className="mt-1 text-sm text-white/70">저장한 내용은 바로 손님 화면에 반영됩니다.</p>
      {message ? <p className="mt-3 text-sm text-[#E8C170]">{message}</p> : null}
      <div className="mt-4 flex flex-col gap-4">
        {steps.map((step) => (
          <BlackfridayStepCard
            key={step.stepOrder}
            step={step}
            onChange={(patch) => update(step.stepOrder, patch)}
            onSave={() => void save(step)}
          />
        ))}
      </div>
    </main>
  );
}

function BlackfridayStepCard({
  step,
  onChange,
  onSave,
}: {
  step: StepDraft;
  onChange: (patch: Partial<StepDraft>) => void;
  onSave: () => void;
}) {
  const field = "w-full rounded-lg border border-[#E8C170]/40 bg-black px-3 py-2 text-sm text-white";
  return (
    <section className="rounded-2xl border border-[#E8C170]/30 p-4">
      <div className="flex items-center gap-2">
        <h2 className="font-bold">
          {step.stepOrder}번 · {step.qrCode}
        </h2>
        <span className="rounded-full border border-[#E8C170] px-2 py-0.5 text-[11px] text-[#E8C170]">
          {floorLabel(step.stepOrder)}
        </span>
      </div>
      <label className="mt-3 block text-xs text-[#E8C170]">
        문제
        <textarea className={`${field} mt-1`} rows={2} value={step.question} onChange={(e) => onChange({ question: e.target.value })} />
      </label>
      <label className="mt-2 block text-xs text-[#E8C170]">
        정답
        <input className={`${field} mt-1`} value={step.answer} onChange={(e) => onChange({ answer: e.target.value })} />
      </label>
      <label className="mt-2 block text-xs text-[#E8C170]">
        칸 패턴(JSON)
        <input className={`${field} mt-1`} value={step.answerDisplay} onChange={(e) => onChange({ answerDisplay: e.target.value })} />
      </label>
      <label className="mt-2 block text-xs text-[#E8C170]">
        위치 힌트
        <input className={`${field} mt-1`} value={step.locationHint} onChange={(e) => onChange({ locationHint: e.target.value })} />
      </label>
      <label className="mt-2 block text-xs text-[#E8C170]">
        힌트
        <input className={`${field} mt-1`} value={step.hint} onChange={(e) => onChange({ hint: e.target.value })} />
      </label>
      <button type="button" onClick={onSave} className="mt-3 w-full rounded-xl bg-[#E8C170] py-2.5 text-sm font-bold text-black">
        저장
      </button>
    </section>
  );
}
