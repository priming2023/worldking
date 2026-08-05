import "./chuseok.css";

export function ChuseokShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="chuseok-theme flex min-h-full flex-1 flex-col bg-gradient-to-b from-[#FFF8F0] via-[#FFF5E6] to-[#F5E6D3]">
      <div className="chuseok-moon pointer-events-none fixed right-4 top-4 h-16 w-16 opacity-40 sm:h-24 sm:w-24" aria-hidden />
      {children}
    </div>
  );
}
