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

function singleGrapheme(text: string): string {
  const g = graphemes(text);
  return g.length === 0 ? "" : (g[g.length - 1] ?? "");
}

/** 아직 조합 중인 자모(ㄱ, ㅂ 등) — 이때는 칸 이동하면 안 됨 */
function isHangulJamo(ch: string): boolean {
  if (!ch) return false;
  const c = ch.codePointAt(0) ?? 0;
  return (
    (c >= 0x1100 && c <= 0x11ff) || // Hangul Jamo
    (c >= 0x3130 && c <= 0x318f) || // Compatibility Jamo
    (c >= 0xa960 && c <= 0xa97f) ||
    (c >= 0xd7b0 && c <= 0xd7ff)
  );
}

/** 네모칸 주관식 — 칸당 1글자, 한글 IME 조합 완료 후에만 다음 칸 */
export function QuizInput({ display, onSubmit, disabled }: QuizInputProps) {
  const flatCount = display.reduce((s, g) => s + g.length, 0);
  const [chars, setChars] = useState<string[]>(() => Array(flatCount).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const composingRef = useRef(false);
  /** compositionend 직후 blur로 빈 onChange가 와서 글자가 지워지는 것 방지 */
  const ignoreEmptyChangeRef = useRef(false);

  useEffect(() => {
    setChars(Array(flatCount).fill(""));
    inputsRef.current = [];
    composingRef.current = false;
  }, [flatCount, display]);

  const focusAt = useCallback((index: number) => {
    const el = inputsRef.current[index];
    if (!el) return;
    el.focus();
  }, []);

  const setCharAt = useCallback((flatIndex: number, ch: string) => {
    setChars((prev) => {
      const next = [...prev];
      next[flatIndex] = ch;
      return next;
    });
  }, []);

  const commitOneAndAdvance = useCallback(
    (flatIndex: number, raw: string) => {
      const ch = singleGrapheme(raw.replace(/\s/g, ""));
      setCharAt(flatIndex, ch);
      if (!ch) return;
      ignoreEmptyChangeRef.current = true;
      window.setTimeout(() => {
        ignoreEmptyChangeRef.current = false;
      }, 50);
      if (flatIndex < flatCount - 1) {
        requestAnimationFrame(() => focusAt(flatIndex + 1));
      }
    },
    [flatCount, focusAt, setCharAt],
  );

  /** 붙여넣기: 여러 글자를 칸에 순서대로 채움 */
  const commitPaste = useCallback(
    (flatIndex: number, raw: string) => {
      const parts = graphemes(raw.replace(/\s/g, ""));
      if (parts.length === 0) return;
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
      const nextFocus = Math.min(flatIndex + parts.length, flatCount - 1);
      ignoreEmptyChangeRef.current = true;
      window.setTimeout(() => {
        ignoreEmptyChangeRef.current = false;
      }, 50);
      requestAnimationFrame(() => focusAt(nextFocus));
    },
    [flatCount, focusAt],
  );

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (flatIndex: number, e: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      const raw = e.data || e.currentTarget.value || "";
      commitOneAndAdvance(flatIndex, raw);
    },
    [commitOneAndAdvance],
  );

  const handleChange = useCallback(
    (flatIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (composingRef.current) {
        // 조합 중: 컨트롤드 인풋이 IME를 지우지 않도록 현재 값 유지 (1음절)
        setCharAt(flatIndex, singleGrapheme(value) || value);
        return;
      }

      // 포커스 이동 직후 빈 change → 무시 (보 가 지워지던 원인)
      if (value === "") {
        if (ignoreEmptyChangeRef.current) return;
        return;
      }

      const parts = graphemes(value.replace(/\s/g, ""));

      // compositionstart보다 change가 먼저 오는 경우(ㅂ만 입력됨) → 이동하지 않음
      if (parts.length === 1 && isHangulJamo(parts[0]!)) {
        setCharAt(flatIndex, parts[0]!);
        return;
      }

      if (parts.length > 1) {
        commitPaste(flatIndex, value);
        return;
      }

      // 영문·숫자·이미 완성된 한글 1글자
      commitOneAndAdvance(flatIndex, value);
    },
    [commitOneAndAdvance, commitPaste, setCharAt],
  );

  const handleKeyDown = useCallback(
    (flatIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (composingRef.current) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        if (chars[flatIndex]) {
          setCharAt(flatIndex, "");
          return;
        }
        if (flatIndex > 0) {
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
