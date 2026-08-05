type ChuseokProgressBarProps = {
  found: number;
  total: number;
  label?: string;
};

export function ChuseokProgressBar({
  found,
  total,
  label = "보물 진행",
}: ChuseokProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((found / total) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm font-bold text-chuseok-burgundy/80">
        <span>{label}</span>
        <span className="tabular-nums">
          {found} / {total}
        </span>
      </div>
      <div
        className="h-4 overflow-hidden rounded-full bg-chuseok-burgundy/10 ring-1 ring-chuseok-gold/30"
        role="progressbar"
        aria-valuenow={found}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-chuseok-gold to-chuseok-burgundy transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
