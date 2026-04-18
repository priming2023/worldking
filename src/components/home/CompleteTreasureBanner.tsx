import Link from "next/link";

type Props = {
  claimedToday: boolean;
};

export function CompleteTreasureBanner({ claimedToday }: Props) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center text-amber-950 shadow-lg ring-1 ring-amber-300/60">
      <p className="text-xl font-extrabold">모든 보물을 찾았어요!</p>
      <Link
        href="/celebrate"
        className="mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-white px-4 text-lg font-extrabold text-amber-900 shadow-md outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-900 active:scale-[0.99]"
      >
        축하 페이지 가기
      </Link>
      {!claimedToday && (
        <Link
          href="/claim"
          className="mt-3 flex w-full min-h-14 items-center justify-center rounded-2xl border-2 border-amber-950/25 bg-white/25 px-4 text-lg font-extrabold text-amber-950 backdrop-blur-sm active:scale-[0.99]"
        >
          선물 받아가기
        </Link>
      )}
      {claimedToday && (
        <p className="mt-3 text-sm font-bold text-amber-950/90">
          오늘 선물은 이미 받았어요. 내일 또 놀러 와 주세요!
        </p>
      )}
    </section>
  );
}
