"use client";

type HalloweenModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  primaryLabel?: string;
  footer?: React.ReactNode;
};

/** 할로윈 모달 — 다크 보라 카드 + 밝은 글씨 */
export function HalloweenModal({
  open,
  title,
  children,
  onClose,
  primaryLabel = "확인",
  footer,
}: HalloweenModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="halloween-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="halloween-card relative z-10 w-full max-w-md rounded-3xl border border-halloween-gold/50 p-6 text-[#faf5ff] shadow-2xl outline-none ring-4 ring-halloween-gold/20"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <h2
          id="halloween-modal-title"
          className="halloween-title text-xl font-extrabold text-halloween-gold"
        >
          {title}
        </h2>
        <div className="mt-3 text-lg leading-relaxed text-[#f3e8ff]">{children}</div>
        {footer ?? (
          <button
            type="button"
            onClick={onClose}
            className="halloween-btn-primary mt-6 w-full min-h-[3.25rem] rounded-2xl py-4 text-lg font-bold outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f97316] active:scale-[0.99]"
          >
            {primaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
