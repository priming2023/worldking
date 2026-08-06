type HalloweenProgressBarProps = {
  found: number;
  total: number;
  label?: string;
};

export function HalloweenProgressBar({
  found,
  total,
  label = "보물 진행",
}: HalloweenProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((found / total) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm font-bold text-halloween-burgundy/80">
        <span>{label}</span>
        <span className="tabular-nums">
          {found} / {total}
        </span>
      </div>
      <div
        className="h-4 overflow-hidden rounded-full bg-halloween-burgundy/10 ring-1 ring-halloween-gold/30"
        role="progressbar"
        aria-valuenow={found}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-halloween-gold to-halloween-burgundy transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
