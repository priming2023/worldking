type Props = {
  text: string;
};

export function EncouragementCard({ text }: Props) {
  return (
    <section
      className="rounded-3xl border border-amber-100 bg-white p-6 text-center text-lg font-semibold leading-relaxed text-slate-800 shadow-sm"
      aria-live="polite"
    >
      <span className="text-2xl" aria-hidden>
        ✨
      </span>
      <p className="mt-2">{text}</p>
    </section>
  );
}
