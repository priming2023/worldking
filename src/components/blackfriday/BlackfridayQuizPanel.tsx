"use client";

import { useState } from "react";
import { QuizAnswerField } from "@/components/quiz/QuizAnswerField";

type Quiz = {
  stepOrder: number;
  question: string;
  answerDisplay: string[][];
  hint: string;
  numeric: boolean;
};

export function BlackfridayQuizPanel({
  quiz,
  revealAnswer,
  wrongCount,
  busy,
  notice,
  onSubmit,
}: {
  quiz: Quiz;
  revealAnswer: string | null;
  wrongCount: number;
  busy: boolean;
  notice?: string;
  onSubmit: (body: { answer?: string; skip?: boolean }) => Promise<void>;
}) {
  const [hintOpen, setHintOpen] = useState(false);

  return (
    <section className="mt-3 rounded-2xl border border-[#E8C170]/30 px-3 py-3">
      <p className="text-center text-sm font-bold text-[#E8C170]">{quiz.stepOrder}/10</p>
      <h1 className="mt-1 text-base font-bold leading-snug">{quiz.question}</h1>
      <div className="mt-3">
        <QuizAnswerField
          key={`${quiz.stepOrder}-${wrongCount >= 3 ? "reveal" : "play"}`}
          theme="blackfriday"
          display={quiz.answerDisplay}
          numeric={quiz.numeric}
          compact
          disabled={busy || Boolean(revealAnswer)}
          countLabel={quiz.numeric ? "숫자" : undefined}
          onSubmit={(answer) => void onSubmit({ answer })}
        />
      </div>
      <button
        type="button"
        className="mt-2 rounded-full border border-[#E8C170]/70 px-3 py-1 text-sm text-[#E8C170]"
        onClick={() => setHintOpen((open) => !open)}
      >
        힌트 보기
      </button>
      {hintOpen ? <p className="mt-1 text-sm text-white/85">{quiz.hint}</p> : null}
      {notice && !revealAnswer ? <p className="mt-2 text-sm text-[#E8C170]">{notice}</p> : null}
      {revealAnswer ? (
        <div className="mt-3 rounded-xl border border-[#E8C170]/50 px-3 py-3 text-center">
          <p className="text-sm">정답은 {revealAnswer} 이에요</p>
          <button
            type="button"
            disabled={busy}
            className="mt-2 w-full rounded-xl bg-[#E8C170] py-2.5 text-sm font-bold text-black disabled:opacity-50"
            onClick={() => void onSubmit({ skip: true })}
          >
            다음으로
          </button>
        </div>
      ) : null}
    </section>
  );
}
