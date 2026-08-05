"use client";

import type { AnswerDisplay } from "@/lib/chuseok/answer-pattern";
import { useCallback, useEffect, useRef, useState } from "react";

type QuizInputProps = {
  display: AnswerDisplay;
  onSubmit: (value: string) => void;
  disabled?: boolean;
};

/** 유니코드 글자 단위로 분리 (한글 음절 1자 = 1칸) */
function graphemes(text: string): string[] {
  return Array.from(text.normalize("NFC")).filter((c) => c.trim() !== "" || c === " ");
}

/** 네모칸 주관식 — 한글 IME 조합 지원, 띄어쓰기는 그룹 사이 gap */
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

  const setCharAt = useCallback((flatIndex: number, ch: string) => {
    setChars((prev) => {
      const next = [...prev];
      next[flatIndex] = ch;
      return next;
    });
  }, []);

  /** 완성된 글자 확정 후 다음 칸으로 */
  const commitAndAdvance = useCallback(
    (flatIndex: number, raw: string) => {
      const parts = graphemes(raw.replace(/\s/g, ""));
      if (parts.length === 0) {
        setCharAt(flatIndex, "");
        return;
      }

      setChars((prev) => {
        const next = [...prev];
        let i = flatIndex;
        for (const p of parts) {
          if (i >= flatCount) break;
          next[i] = p;
          i += 1;
        }
        return next;
      });

      const nextIndex = Math.min(flatIndex + parts.length, flatCount - 1);
      if (flatIndex + parts.length < flatCount) {
        requestAnimationFrame(() => focusAt(nextIndex));
      }
    },
    [flatCount, focusAt, setCharAt],
  );

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (flatIndex: number, e: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      commitAndAdvance(flatIndex, e.currentTarget.value || e.data || "");
    },
    [commitAndAdvance],
  );

  const handleChange = useCallback(
    (flatIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // 한글 조합 중: 중간 자모(ㅅ→소→송)를 칸에 그대로 보여 줌, 칸 이동 없음
      if (composingRef.current) {
        setCharAt(flatIndex, value);
        return;
      }

      // 영문·숫자·붙여넣기 등 (조합 없음)
      commitAndAdvance(flatIndex, value);
    },
    [commitAndAdvance, setCharAt],
  );

  const handleKeyDown = useCallback(
    (flatIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (composingRef.current) return;

      if (e.key === "Backspace") {
        if (chars[flatIndex]) {
          setCharAt(flatIndex, "");
          return;
        }
        if (flatIndex > 0) {
          e.preventDefault();
          setCharAt(flatIndex - 1, "");
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
    [chars, flatCount, focusAt, setCharAt],
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
                    className="chuseok-box-input h-12 w-11 rounded-lg border-2 border-chuseok-gold/50 bg-white/95 text-center text-xl font-bold text-chuseok-burgundy shadow-sm focus:border-chuseok-gold focus:outline-none focus:ring-2 focus:ring-chuseok-gold/30 disabled:opacity-50 sm:h-14 sm:w-12 sm:text-2xl"
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
