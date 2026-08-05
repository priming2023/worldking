"use client";

import Link from "next/link";
import { Modal } from "@/components/Modal";

type Props = {
  dupOpen: boolean;
  onDupClose: () => void;
  errOpen: boolean;
  errText: string;
  onErrClose: () => void;
  successOpen: boolean;
  successCount: number;
  onNextQuiz: () => void;
  canClaim?: boolean;
};

/** 추석 미션 전용 — 기존 /claim·/map 과 연결하지 않음 */
export function ChuseokScanResultModals({
  dupOpen,
  onDupClose,
  errOpen,
  errText,
  onErrClose,
  successOpen,
  successCount,
  onNextQuiz,
  canClaim = false,
}: Props) {
  return (
    <>
      <Modal open={dupOpen} title="이미 찾은 보물이에요" onClose={onDupClose}>
        <p className="text-center text-lg font-semibold text-chuseok-burgundy">
          이 QR은 오늘 이미 찾았어요. 다른 미션 QR을 찍어 주세요!
        </p>
      </Modal>

      <Modal open={errOpen} title="알림" onClose={onErrClose}>
        <p>{errText}</p>
      </Modal>

      <Modal
        open={successOpen}
        title="보물을 찾았어요!"
        onClose={onNextQuiz}
        footer={
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={onNextQuiz}
              className="chuseok-btn-primary min-h-12 w-full rounded-2xl text-lg font-extrabold"
            >
              다음 퀴즈로 가기
            </button>
            {canClaim && (
              <Link
                href="/chuseok/claim"
                className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-chuseok-gold/50 bg-white text-lg font-bold text-chuseok-burgundy"
              >
                코인 받으러 가기
              </Link>
            )}
          </div>
        }
      >
        <p className="text-center text-lg font-semibold text-chuseok-burgundy">
          오늘 찾은 미션 보물{" "}
          <span className="text-2xl font-extrabold tabular-nums text-chuseok-gold">
            {successCount}
          </span>
          개!
        </p>
      </Modal>
    </>
  );
}
