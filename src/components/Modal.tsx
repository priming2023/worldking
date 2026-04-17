"use client";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  primaryLabel?: string;
  /** 지정 시 기본 확인 버튼 대신 렌더 */
  footer?: React.ReactNode;
};

export function Modal({
  open,
  title,
  children,
  onClose,
  primaryLabel = "확인",
  footer,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-amber-100 bg-white p-6 text-slate-900 shadow-2xl outline-none ring-4 ring-amber-200/40"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-xl font-extrabold text-amber-950">
          {title}
        </h2>
        <div className="mt-3 text-lg leading-relaxed text-slate-800">{children}</div>
        {footer ?? (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full min-h-[3.25rem] rounded-2xl bg-amber-500 py-4 text-lg font-bold text-amber-950 shadow-sm outline-offset-4 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700 active:scale-[0.99]"
          >
            {primaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
