"use client";

import { HalloweenModal } from "@/components/halloween/HalloweenModal";

type OrderWarningModalProps = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function OrderWarningModal({
  open,
  message,
  onConfirm,
  onCancel,
}: OrderWarningModalProps) {
  return (
    <HalloweenModal
      open={open}
      title="다른 QR이에요"
      onClose={onCancel}
      footer={
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="halloween-btn-primary min-h-12 w-full rounded-2xl py-3 text-lg font-extrabold"
          >
            맞는 QR 다시 찾기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 w-full rounded-2xl border-2 border-halloween-gold/40 bg-white py-3 text-base font-bold text-halloween-burgundy/80"
          >
            그래도 스캔하기 (순서 포기)
          </button>
        </div>
      }
    >
      <p className="whitespace-pre-line text-base leading-relaxed">{message}</p>
    </HalloweenModal>
  );
}
