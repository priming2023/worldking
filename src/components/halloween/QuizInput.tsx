"use client";

import type { AnswerDisplay } from "@/lib/halloween/answer-pattern";
import { useEffect, useId, useRef, useState } from "react";

type QuizInputProps = {
  display: AnswerDisplay;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  /** 예: "숫자3개" — 없으면 "N글자" */
  countLabel?: string;
  /** true면 모바일 숫자 키패드 */
  numeric?: boolean;
};

function graphemes(text: string): string[] {
  return Array.from(text.normalize("NFC"));
}

function trimToBoxes(raw: string, flatCount: number): string {
  return graphemes(raw.replace(/\s/g, "")).slice(0, flatCount).join("");
}

/** 미완성 자모(천지인 중간 상태) */
function hasIncompleteHangul(text: string): boolean {
  return /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/.test(text);
}

/**
 * 모바일 한글 입력(아이폰 천지인 포함).
 * controlled value 로 IME를 덮어쓰지 않고, 표시용 상태만 갱신한다.
 */
export function QuizInput({
  display,
  onSubmit,
  disabled,
  countLabel,
  numeric = false,
}: QuizInputProps) {
  const flatCount = display.reduce((s, g) => s + g.length, 0);
  const labelText = countLabel ?? `${flatCount}글자`;
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const [preview, setPreview] = useState("");
  const fieldKey = useId() + String(flatCount) + JSON.stringify(display);

  useEffect(() => {
    setPreview("");
    composingRef.current = false;
    if (inputRef.current) inputRef.current.value = "";
  }, [fieldKey]);

  const syncPreview = (raw: string, forceTrim: boolean) => {
    if (!forceTrim && (composingRef.current || hasIncompleteHangul(raw))) {
      setPreview(raw);
      return;
    }
    const trimmed = trimToBoxes(raw, flatCount);
    setPreview(trimmed);
    if (inputRef.current && inputRef.current.value !== trimmed && forceTrim) {
      inputRef.current.value = trimmed;
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value;
    const native = e.nativeEvent as InputEvent;
    const composing =
      composingRef.current || native.isComposing === true;

    if (composing || hasIncompleteHangul(raw)) {
      composingRef.current = composing || hasIncompleteHangul(raw);
      setPreview(raw);
      return;
    }
    composingRef.current = false;
    const trimmed = trimToBoxes(raw, flatCount);
    setPreview(trimmed);
    if (raw.replace(/\s/g, "").length > flatCount && inputRef.current) {
      inputRef.current.value = trimmed;
    }
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    window.setTimeout(() => {
      composingRef.current = false;
      syncPreview(value, true);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputRef.current?.value ?? preview;
    onSubmit(trimToBoxes(raw, flatCount));
  };

  const chars = graphemes(preview.replace(/\s/g, "")).slice(0, flatCount);
  let flatIdx = 0;

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {display.map((group, gi) => (
          <div key={gi} className="flex items-center gap-3">
            {gi > 0 && (
              <span className="text-halloween-gold/60 text-lg font-bold" aria-hidden>
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
                    className="halloween-box-input flex h-11 w-10 items-center justify-center rounded-lg border-2 border-halloween-gold/50 text-lg font-bold sm:h-12 sm:w-11 sm:text-xl"
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

      <label className="flex w-full max-w-sm flex-col gap-2">
        <span className="text-center text-sm font-bold text-halloween-burgundy/80">
          정답 입력 ({labelText})
        </span>
        <input
          key={fieldKey}
          ref={inputRef}
          type={numeric ? "tel" : "text"}
          inputMode={numeric ? "numeric" : "text"}
          enterKeyHint="done"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={disabled}
          defaultValue=""
          placeholder={numeric ? "숫자로 입력하세요" : "여기에 정답을 입력하세요"}
          className="min-h-14 w-full rounded-2xl border-2 border-halloween-gold/60 bg-[#1a0b2e] px-4 py-3 text-center text-lg font-bold text-white shadow-sm outline-none placeholder:font-semibold placeholder:text-white/40 focus:border-halloween-gold focus:ring-2 focus:ring-halloween-gold/30 disabled:opacity-50"
          style={{ fontSize: "16px" }}
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
      </label>

      <button
        type="submit"
        disabled={disabled || chars.length === 0}
        className="halloween-btn-primary min-h-14 w-full max-w-sm rounded-2xl px-6 py-3 text-lg font-extrabold disabled:opacity-50"
      >
        정답 확인
      </button>
    </form>
  );
}
