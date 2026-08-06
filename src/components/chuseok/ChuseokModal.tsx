"use client";

type ChuseokModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  primaryLabel?: string;
  footer?: React.ReactNode;
};

/** 추석 미션용 모달 — burgundy / gold */
export function ChuseokModal({
  open,
  title,
  children,
  onClose,
  primaryLabel = "확인",
  footer,
}: ChuseokModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chuseok-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-chuseok-gold/40 bg-[#FFF8F0] p-6 text-chuseok-burgundy shadow-2xl outline-none ring-4 ring-chuseok-gold/25"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <h2
          id="chuseok-modal-title"
          className="chuseok-title text-xl font-extrabold text-chuseok-burgundy"
        >
          {title}
        </h2>
        <div className="mt-3 text-lg leading-relaxed text-chuseok-burgundy/90">
          {children}
        </div>
        {footer ?? (
          <button
            type="button"
            onClick={onClose}
            className="chuseok-btn-primary mt-6 w-full min-h-[3.25rem] rounded-2xl py-4 text-lg font-bold outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8b2942] active:scale-[0.99]"
          >
            {primaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
