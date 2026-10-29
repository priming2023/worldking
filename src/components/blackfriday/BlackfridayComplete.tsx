import { BlackfridayHeader } from "@/components/blackfriday/BlackfridayHeader";

const APP_URL = "https://worldking-attendance.vercel.app/app/dangjin-seosan";

export function BlackfridayComplete() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-5 py-6 text-center">
      <BlackfridayHeader progress="10/10" />
      <h1 className="text-2xl font-bold">🎉 10개 모두 찾았습니다!</h1>
      <p className="text-base leading-relaxed">직원에게 이 화면을 보여주시면 코인 20개를 드려요.</p>
      <hr className="border-[#E8C170]/50" />
      <div className="rounded-2xl border border-[#E8C170]/40 px-4 py-4 text-sm leading-relaxed">
        <p>월드킹 블랙프라이데이 · 11.20(금) ~ 11.29(일) 열흘간</p>
        <p className="mt-2">
          2시간 이용권 10장 <span className="font-bold text-[#E8C170]">80,000원</span> (정가 140,000원)
        </p>
        <p className="mt-2 text-white/80">1년에 한 번, 이 기간에만 판매합니다.</p>
      </div>
      <a
        href={APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl bg-[#E8C170] px-4 py-3 text-base font-bold text-black"
      >
        월드킹 고객앱 열기
      </a>
    </main>
  );
}
