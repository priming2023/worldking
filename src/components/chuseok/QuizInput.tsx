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
 * 모바일(아이폰·안드로이드) 한글 입력용.
 * - 잘 보이는 큰 입력창 (투명 오버레이 X, 글자 16px 이상 → iOS 확대 방지)
 * - 한글 조합(IME) 중에는 값을 자르지 않음
 * - 네모칸은 글자 수 힌트 + 입력된 글자 표시
 */
export function QuizInput({ display, onSubmit, disabled }: QuizInputProps) {
  const flatCount = display.reduce((s, g) => s + g.length, 0);
  const [text, setText] = useState("");
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText("");
    composingRef.current = false;
  }, [flatCount, display]);

  const trimToBoxes = useCallback(
    (raw: string) =>
      graphemes(raw.replace(/\s/g, "")).slice(0, flatCount).join(""),
    [flatCount],
  );

  const chars = graphemes(text.replace(/\s/g, "")).slice(0, flatCount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // 조합 중에는 절대 자르거나 normalize 하지 않음 (송·보 등 깨짐 방지)
    if (composingRef.current) {
      setText(raw);
      return;
    }
    setText(trimToBoxes(raw));
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    setText(trimToBoxes(e.currentTarget.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 공백 무시 비교는 서버/normalize에서 처리. 여기서는 칸 글자만 합쳐 전달
    onSubmit(chars.join(""));
  };

  let flatIdx = 0;

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
      {/* 글자 수 힌트 네모 */}
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
                const filled = chars[i] ?? "";
                return (
                  <span
                    key={`${gi}-${ci}`}
                    className="chuseok-box-input flex h-11 w-10 items-center justify-center rounded-lg border-2 border-chuseok-gold/50 bg-white/95 text-lg font-bold text-chuseok-burgundy sm:h-12 sm:w-11 sm:text-xl"
                    aria-hidden
                  >
                    {filled}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 모바일용 실제 입력창 — 크게, 보이기 쉽게 */}
      <label className="flex w-full max-w-sm flex-col gap-2">
        <span className="text-center text-sm font-bold text-chuseok-burgundy/80">
          정답 입력 ({flatCount}글자)
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          enterKeyHint="done"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={disabled}
          value={text}
          placeholder="여기에 정답을 입력하세요"
          className="min-h-14 w-full rounded-2xl border-2 border-chuseok-gold/60 bg-white px-4 py-3 text-center text-lg font-bold text-chuseok-burgundy shadow-sm outline-none placeholder:font-semibold placeholder:text-chuseok-burgundy/35 focus:border-chuseok-gold focus:ring-2 focus:ring-chuseok-gold/30 disabled:opacity-50"
          style={{ fontSize: "16px" }}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
      </label>

      <button
        type="submit"
        disabled={disabled || chars.length === 0}
        className="chuseok-btn-primary min-h-14 w-full max-w-sm rounded-2xl px-6 py-3 text-lg font-extrabold disabled:opacity-50"
      >
        정답 확인
      </button>
    </form>
  );
}
