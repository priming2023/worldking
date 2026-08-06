import Link from "next/link";

/** 순서 포기 후 — 퀴즈 없이 QR만 찾기 */
export function ChuseokUnorderedExplore() {
  return (
    <section className="chuseok-card rounded-3xl p-5 text-center">
      <p className="text-sm font-bold text-chuseok-gold">자유 탐색</p>
      <p className="mt-2 text-lg font-extrabold text-chuseok-burgundy">
        퀴즈 없이 미션 QR만 찾아 주세요
      </p>
      <p className="mt-2 text-sm font-semibold text-chuseok-burgundy/70">
        x2 코인 찬스는 사라졌어요. (하루 1회 수령)
      </p>
      <Link
        href="/chuseok/scan?auto=1"
        className="chuseok-btn-primary mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl text-lg font-extrabold"
      >
        📷 카메라로 QR 찾기
      </Link>
    </section>
  );
}
