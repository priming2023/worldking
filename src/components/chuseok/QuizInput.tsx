"use client";

import type { AnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { useCallback, useEffect, useRef, useState } from "react";

type QuizInputProps = {
  display: AnswerDisplay;
  onSubmit: (value: string) => void;
  disabled?: boolean;
};

/** 네모칸 주관식 — 띄어쓰기는 그룹 사이 gap으로 표현 */
export function QuizInput({ display, onSubmit, disabled }: QuizInputProps) {
  const flatCount = display.reduce((s, g) => s + g.length, 0);
  const [chars, setChars] = useState<string[]>(() => Array(flatCount).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setChars(Array(flatCount).fill(""));
    inputsRef.current = [];
  }, [flatCount, display]);

  const handleChange = useCallback(
    (flatIndex: number, value: string) => {
      const ch = value.slice(-1);
      setChars((prev) => {
        const next = [...prev];
        next[flatIndex] = ch;
        return next;
      });
      if (ch && flatIndex < flatCount - 1) {
        inputsRef.current[flatIndex + 1]?.focus();
      }
    },
    [flatCount],
  );

  const handleKeyDown = useCallback(
    (flatIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !chars[flatIndex] && flatIndex > 0) {
        inputsRef.current[flatIndex - 1]?.focus();
      }
    },
    [chars],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      let idx = 0;
      const words = display.map((group) => {
        const word = group.map(() => chars[idx++] ?? "").join("");
        return word;
      });
      onSubmit(words.join(" "));
    },
    [chars, display, onSubmit],
  );

  let flatIdx = 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {display.map((group, gi) => (
          <div key={gi} className="flex items-center gap-3">
            {gi > 0 && (
              <span className="text-chuseok-gold/60 text-lg font-bold" aria-hidden>
                ·
              </span>
            )}
            <div className="flex gap-1.5">
              {group.map((_, ci) => {
                const i = flatIdx++;
                return (
                  <input
                    key={`${gi}-${ci}`}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={chars[i] ?? ""}
                    disabled={disabled}
                    aria-label={`글자 ${i + 1}`}
                    className="chuseok-box-input h-12 w-11 rounded-lg border-2 border-chuseok-gold/50 bg-white/95 text-center text-xl font-bold text-chuseok-burgundy shadow-sm focus:border-chuseok-gold focus:outline-none focus:ring-2 focus:ring-chuseok-gold/30 disabled:opacity-50 sm:h-14 sm:w-12 sm:text-2xl"
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="chuseok-btn-primary min-h-12 w-full max-w-xs rounded-2xl px-6 py-3 text-lg font-extrabold disabled:opacity-50"
      >
        정답 확인
      </button>
    </form>
  );
}
