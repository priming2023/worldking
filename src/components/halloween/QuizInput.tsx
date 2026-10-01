"use client";

import { QuizAnswerField } from "@/components/quiz/QuizAnswerField";
import type { AnswerDisplay } from "@/lib/halloween/answer-pattern";

type QuizInputProps = {
  display: AnswerDisplay;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  countLabel?: string;
  numeric?: boolean;
};

export function QuizInput(props: QuizInputProps) {
  return <QuizAnswerField theme="halloween" {...props} />;
}
