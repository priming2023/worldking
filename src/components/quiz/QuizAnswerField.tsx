"use client";

import { useEffect, useId, useRef, useState } from "react";

export type AnswerBoxes = string[][];

export type QuizAnswerTheme = "chuseok" | "halloween";

type Props = {
  theme: QuizAnswerTheme;
  display: AnswerBoxes;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  countLabel?: string;
  numeric?: boolean;
};

function graphemes(text: string): string[] {
  return Array.from(text.normalize("NFC"));
}

function trimToBoxes(raw: string, flatCount: number): string {
  return graphemes(raw.replace(/\s/g, "")).slice(0, flatCount).join("");
}

const themeClass = {
  chuseok: {
    dot: "text-chuseok-gold/60",
    box: "chuseok-box-input flex h-11 w-10 items-center justify-center rounded-lg border-2 border-chuseok-gold/50 bg-white/95 text-lg font-bold text-chuseok-burgundy sm:h-12 sm:w-11 sm:text-xl",
    label: "text-chuseok-burgundy/80",
    input:
      "min-h-14 w-full rounded-2xl border-2 border-chuseok-gold/60 bg-white px-4 py-3 text-center text-lg font-bold text-chuseok-burgundy shadow-sm outline-none placeholder:font-semibold placeholder:text-chuseok-burgundy/35 focus:border-chuseok-gold focus:ring-2 focus:ring-chuseok-gold/30 disabled:opacity-50",
    button: "chuseok-btn-primary",
  },
  halloween: {
    dot: "text-halloween-gold/60",
    box: "halloween-box-input flex h-11 w-10 items-center justify-center rounded-lg border-2 border-halloween-gold/50 bg-[#1a0b2e] text-lg font-bold text-white sm:h-12 sm:w-11 sm:text-xl",
    label: "text-halloween-gold",
    input:
      "min-h-14 w-full rounded-2xl border-2 border-halloween-gold/60 bg-[#1a0b2e] px-4 py-3 text-center text-lg font-bold text-white shadow-sm outline-none placeholder:font-semibold placeholder:text-white/40 focus:border-halloween-gold focus:ring-2 focus:ring-halloween-gold/30 disabled:opacity-50",
    button: "halloween-btn-primary",
  },
} as const;

/**
 * 추석·할로윈 공용 정답 입력.
 * IME(아이폰 천지인·안드로이드 두벌식) 조합 중에는 입력값을 덮어쓰지 않는다.
 */
export function QuizAnswerField({
  theme,
  display,
  onSubmit,
  disabled,
  countLabel,
  numeric = false,
}: Props) {
  const ui = themeClass[theme];
  const flatCount = display.reduce((sum, group) => sum + group.length, 0);
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

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value;
    const native = e.nativeEvent as InputEvent;
    const composing = composingRef.current || native.isComposing === true;
    setPreview(raw);
    if (composing) return;
    composingRef.current = false;
    if (graphemes(raw.replace(/\s/g, "")).length <= flatCount) return;
    const trimmed = trimToBoxes(raw, flatCount);
    setPreview(trimmed);
    if (inputRef.current) inputRef.current.value = trimmed;
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    setPreview(e.currentTarget.value);
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
              <span className={`${ui.dot} text-lg font-bold`} aria-hidden>
                ·
              </span>
            )}
            <div className="flex gap-1.5">
              {group.map((_, ci) => {
                const i = flatIdx++;
                return (
                  <span key={`${gi}-${ci}`} className={ui.box} aria-hidden>
                    {chars[i] ?? ""}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <label className="flex w-full max-w-sm flex-col gap-2">
        <span className={`text-center text-sm font-bold ${ui.label}`}>
          정답 입력 ({labelText})
        </span>
        <input
          key={fieldKey}
          ref={inputRef}
          lang="ko"
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
          className={ui.input}
          style={{ fontSize: "16px" }}
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
      </label>

      <button
        type="submit"
        disabled={disabled || chars.length === 0}
        className={`${ui.button} min-h-14 w-full max-w-sm rounded-2xl px-6 py-3 text-lg font-extrabold disabled:opacity-50`}
      >
        정답 확인
      </button>
    </form>
  );
}
