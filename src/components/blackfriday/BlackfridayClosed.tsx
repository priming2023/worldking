import { BlackfridayHeader } from "@/components/blackfriday/BlackfridayHeader";

export function BlackfridayClosed() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <BlackfridayHeader />
      <h1 className="mt-6 text-2xl font-bold">이벤트가 종료되었습니다</h1>
      <p className="mt-3 text-sm text-white/70">2026년 11월 20일(금) ~ 11월 29일(일)</p>
    </main>
  );
}
