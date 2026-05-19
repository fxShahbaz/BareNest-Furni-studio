export default function Marquee() {
  const items = [
    "Solid Wood",
    "Dense MDF",
    "No Particle Board",
    "Hand-Finished",
    "Eight Years In",
    "Showroom · June 2026",
  ];
  const repeated = [...items, ...items, ...items];
  return (
    <section className="border-y border-ink/10 bg-bone py-6 overflow-hidden">
      <div className="flex whitespace-nowrap will-change-transform animate-marquee gap-12">
        {repeated.map((w, i) => (
          <span
            key={i}
            className="font-display text-3xl md:text-5xl tracking-tight"
          >
            {w}
            <span className="serif-italic text-rust"> ·</span>
          </span>
        ))}
      </div>
    </section>
  );
}
