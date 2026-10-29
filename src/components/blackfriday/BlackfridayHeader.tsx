export function BlackfridayHeader({ progress }: { progress?: string }) {
  return (
    <header className="text-center">
      <p className="text-[10px] font-semibold tracking-[0.28em] text-[#E8C170]">BLACK FRIDAY</p>
      <p className="mt-1 text-sm font-semibold tracking-tight">월드킹 블랙프라이데이 보물찾기</p>
      {progress ? (
        <p className="mt-2 text-sm font-bold tabular-nums text-[#E8C170]">{progress}</p>
      ) : null}
      <div className="mx-auto mt-2 h-px w-12 bg-[#E8C170]" aria-hidden />
    </header>
  );
}
