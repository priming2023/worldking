"use client";

import type { AnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { useCallback, useEffect, useRef, useState } from "react";

type QuizInputProps = {
  display: AnswerDisplay;
  onSubmit: (value: string) => void;
  disabled?: boolean;
};

function graphemes(text: string): string[] {
  return Array.from(text.normalize("NFC"));
}

/**
 * 네모칸은 표시만, 실제 입력은 투명한 단일 input.
 * 칸마다 input을 두면 한글 첫 글자(보 등) 조합이 깨짐.
 */
export function QuizInput({ display, onSubmit, disabled }: QuizInputProps) {
  const flatCount = display.reduce((s, g) => s + g.length, 0);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText("");
    // 퀴즈가 바뀌면 입력란에 포커스
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [flatCount, display]);

  const chars = graphemes(text.replace(/\s/g, "")).slice(0, flatCount);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = graphemes(e.target.value.replace(/\s/g, ""))
        .slice(0, flatCount)
        .join("");
      setText(next);
    },
    [flatCount],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      let idx = 0;
      const words = display.map((group) =>
        group.map(() => chars[idx++] ?? "").join(""),
      );
      onSubmit(words.join(" "));
    },
    [chars, display, onSubmit],
  );

  let flatIdx = 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm">
        {/* 표시용 네모칸 */}
        <div className="pointer-events-none flex flex-wrap items-center justify-center gap-3 px-1 py-2">
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
                  const filled = chars[i] ?? "";
                  const isActive = i === Math.min(chars.length, flatCount - 1);
                  return (
                    <span
                      key={`${gi}-${ci}`}
                      className={`chuseok-box-input flex h-12 w-11 items-center justify-center overflow-hidden rounded-lg border-2 bg-white/95 text-xl font-bold text-chuseok-burgundy shadow-sm sm:h-14 sm:w-12 sm:text-2xl ${
                        isActive
                          ? "border-chuseok-gold ring-2 ring-chuseok-gold/30"
                          : "border-chuseok-gold/50"
                      }`}
                    >
                      {filled}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 실제 입력 (투명 오버레이) — 한글 IME 정상 */}
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          enterKeyHint="done"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          value={text}
          aria-label="정답 입력"
          className="absolute inset-0 z-10 cursor-text bg-transparent text-transparent caret-chuseok-burgundy outline-none"
          style={{ caretColor: "#8b2942" }}
          onChange={handleChange}
        />
      </div>

      <p className="text-xs font-semibold text-chuseok-burgundy/60">
        {chars.length}/{flatCount}글자
      </p>

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
