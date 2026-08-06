"use client";

import { QuizInput } from "@/components/chuseok/QuizInput";
import type { AnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

type Props = {
  stepOrder: number;
  question: string;
  answerDisplay: AnswerDisplay;
  onSubmit: (answer: string) => void;
  submitting: boolean;
  error: string | null;
};

export function ChuseokScanQuizPanel({
  stepOrder,
  question,
  answerDisplay,
  onSubmit,
  submitting,
  error,
}: Props) {
  return (
    <section className="chuseok-card rounded-3xl p-5">
      <p className="text-sm font-bold text-chuseok-gold">
        퀴즈 {stepOrder} / {MISSION_TOTAL}
      </p>
      <h2 className="mt-2 text-lg font-extrabold leading-snug text-chuseok-burgundy">
        {question}
      </h2>
      <div className="mt-5">
        <QuizInput
          display={answerDisplay}
          onSubmit={onSubmit}
          disabled={submitting}
          countLabel={stepOrder === 4 ? "숫자3개" : undefined}
          numeric={stepOrder === 4}
        />
      </div>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-800" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
