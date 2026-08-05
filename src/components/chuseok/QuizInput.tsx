"use client";

import type { AnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { useCallback, useEffect, useRef, useState } from "react";

type QuizInputProps = {
  display: AnswerDisplay;
  onSubmit: (value: string) => void;
  disabled?: boolean;
};

/** NFC 기준 글자 배열 (한글 1음절 = 1글자) */
function graphemes(text: string): string[] {
  return Array.from(text.normalize("NFC"));
}

/** 칸에는 항상 최대 1글자만 */
function singleGrapheme(text: string): string {
  const g = graphemes(text);
  if (g.length === 0) return "";
  return g[g.length - 1] ?? "";
}

/** 네모칸 주관식 — 칸당 1글자 + 한글 IME 조합 */
export function QuizInput({ display, onSubmit, disabled }: QuizInputProps) {
  const flatCount = display.reduce((s, g) => s + g.length, 0);
  const [chars, setChars] = useState<string[]>(() => Array(flatCount).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const composingRef = useRef(false);

  useEffect(() => {
    setChars(Array(flatCount).fill(""));
    inputsRef.current = [];
    composingRef.current = false;
  }, [flatCount, display]);

  const focusAt = useCallback((index: number) => {
    const el = inputsRef.current[index];
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  /** 이 칸에 1글자만 넣고, 남는 글자는 다음 칸으로 */
  const commitChars = useCallback(
    (flatIndex: number, raw: string) => {
      const parts = graphemes(raw).filter((c) => c !== " ");
      setChars((prev) => {
        const next = [...prev];
        if (parts.length === 0) {
          next[flatIndex] = "";
          return next;
        }
        let i = flatIndex;
        for (const p of parts) {
          if (i >= flatCount) break;
          next[i] = p; // 칸당 정확히 1글자
          i += 1;
        }
        return next;
      });
      if (parts.length === 0) return;
      const advanceTo = flatIndex + parts.length;
      if (advanceTo < flatCount) {
        requestAnimationFrame(() => focusAt(advanceTo));
      } else if (flatIndex < flatCount - 1) {
        requestAnimationFrame(() => focusAt(flatCount - 1));
      }
    },
    [flatCount, focusAt],
  );

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (flatIndex: number, e: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      // 조합 완료 → 이 칸에는 완성된 1글자만
      const raw = e.data || e.currentTarget.value || "";
      commitChars(flatIndex, singleGrapheme(raw));
    },
    [commitChars],
  );

  const handleChange = useCallback(
    (flatIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (composingRef.current) {
        // 조합 중(ㅅ→소→송): 화면에 1음절만 허용
        setChars((prev) => {
          const next = [...prev];
          next[flatIndex] = singleGrapheme(value);
          return next;
        });
        return;
      }

      commitChars(flatIndex, value);
    },
    [commitChars],
  );

  const handleKeyDown = useCallback(
    (flatIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (composingRef.current) return;

      if (e.key === "Backspace") {
        if (chars[flatIndex]) {
          e.preventDefault();
          setChars((prev) => {
            const next = [...prev];
            next[flatIndex] = "";
            return next;
          });
          return;
        }
        if (flatIndex > 0) {
          e.preventDefault();
          setChars((prev) => {
            const next = [...prev];
            next[flatIndex - 1] = "";
            return next;
          });
          focusAt(flatIndex - 1);
        }
        return;
      }

      if (e.key === "ArrowLeft" && flatIndex > 0) {
        e.preventDefault();
        focusAt(flatIndex - 1);
      }
      if (e.key === "ArrowRight" && flatIndex < flatCount - 1) {
        e.preventDefault();
        focusAt(flatIndex + 1);
      }
    },
    [chars, flatCount, focusAt],
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
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={chars[i] ?? ""}
                    disabled={disabled}
                    aria-label={`글자 ${i + 1}`}
                    className="chuseok-box-input h-12 w-11 overflow-hidden rounded-lg border-2 border-chuseok-gold/50 bg-white/95 text-center text-xl font-bold text-chuseok-burgundy shadow-sm focus:border-chuseok-gold focus:outline-none focus:ring-2 focus:ring-chuseok-gold/30 disabled:opacity-50 sm:h-14 sm:w-12 sm:text-2xl"
                    onChange={(e) => handleChange(i, e)}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={(e) => handleCompositionEnd(i, e)}
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
