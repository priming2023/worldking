"use client";

type HalloweenModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  primaryLabel?: string;
  footer?: React.ReactNode;
};

/** 추석 미션용 모달 — burgundy / gold */
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
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
        className="relative z-10 w-full max-w-md rounded-3xl border border-halloween-gold/40 bg-[#FFF8F0] p-6 text-halloween-burgundy shadow-2xl outline-none ring-4 ring-halloween-gold/25"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <h2
          id="halloween-modal-title"
          className="halloween-title text-xl font-extrabold text-halloween-burgundy"
        >
          {title}
        </h2>
        <div className="mt-3 text-lg leading-relaxed text-halloween-burgundy/90">
          {children}
        </div>
        {footer ?? (
          <button
            type="button"
            onClick={onClose}
            className="halloween-btn-primary mt-6 w-full min-h-[3.25rem] rounded-2xl py-4 text-lg font-bold outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8b2942] active:scale-[0.99]"
          >
            {primaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
