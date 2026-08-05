"use client";

import { Modal } from "@/components/Modal";

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
    <Modal
      open={open}
      title="순서가 맞지 않아요"
      onClose={onCancel}
      footer={
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="chuseok-btn-primary min-h-12 w-full rounded-2xl py-3 text-lg font-extrabold"
          >
            스캔할게요
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 w-full rounded-2xl border-2 border-chuseok-gold/40 bg-white py-3 text-lg font-bold text-chuseok-burgundy"
          >
            취소
          </button>
        </div>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
