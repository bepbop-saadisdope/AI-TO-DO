function Icon({ name }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

// Button accent adapts to the time of day so it harmonizes with the room mood.
const ACCENT = {
  morning: "#cf6a34",
  noon: "#d98a3c",
  dusk: "#c1512f",
  night: "#5b6aa8",
};

export default function Header({ onNew, onOpenAmbiance, time }) {
  const accent = ACCENT[time] ?? ACCENT.morning;

  return (
    <header className="flex items-center gap-4 md:gap-6 w-full px-6 md:px-10 py-5 max-w-[1200px] mx-auto">
      <div className="font-display text-[24px] md:text-[28px] text-primary tracking-tighter select-none">PIXIDO</div>

      {/* Top-left HUD so the controls don't collide with the window */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNew}
          style={{ background: accent }}
          className="pixel-btn text-white px-5 py-3 text-[11px] flex items-center gap-2 hover:brightness-105 transition-colors duration-500"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          NEW NOTE
        </button>
        <button
          onClick={onOpenAmbiance}
          title="Ambiance"
          aria-label="Ambiance"
          style={{ background: accent }}
          className="pixel-btn icon-btn w-11 h-11 text-white hover:brightness-105 transition-colors duration-500"
        >
          <Icon name="cloud" />
        </button>
      </div>
    </header>
  );
}
