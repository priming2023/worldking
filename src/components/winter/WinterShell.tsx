import { WinterSnow } from "@/components/winter/WinterSnow";
import "./winter.css";

export function WinterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="winter-theme winter-body relative flex min-h-full flex-1 flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_#2a5578_0%,_#12324f_45%,_#0a1a2b_100%)] text-[var(--winter-snow)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.18),transparent)]"
        aria-hidden
      />
      <WinterSnow />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  );
}
