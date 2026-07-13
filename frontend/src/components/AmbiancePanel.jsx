import { TIMES, WEATHERS, windLabel, DEFAULT_AMBIANCE } from "../lib/ambiance";

const TIME_ICON = { morning: "wb_sunny", noon: "light_mode", dusk: "wb_twilight", night: "dark_mode" };
const WEATHER_ICON = { clear: "sunny", cloud: "cloud", rain: "rainy", snow: "ac_unit" };

function OptionButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-colors ${
        active ? "bg-secondary-container border-primary" : "bg-surface border-outline-variant hover:bg-surface-variant"
      }`}
    >
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <span className="font-label text-[10px] uppercase">{label}</span>
    </button>
  );
}

// Slide-in mood panel. Changes are lifted to the parent and applied live.
export default function AmbiancePanel({ ambiance, onChange, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-surface-container-low border-l-4 border-primary/15 shadow-2xl flex flex-col">
        <div className="p-6 border-b-2 border-primary/10 flex justify-between items-start">
          <div>
            <h2 className="font-display text-[14px] text-primary uppercase mb-1">Ambiance</h2>
            <p className="font-body text-[16px] text-on-surface-variant">Customize your desk mood</p>
          </div>
          <button onClick={onClose} className="icon-btn w-8 h-8 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">Time of day</span>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {TIMES.map((t) => (
                <OptionButton key={t} active={ambiance.time === t} icon={TIME_ICON[t]} label={t.slice(0, 4)} onClick={() => onChange({ time: t })} />
              ))}
            </div>
          </section>

          <section>
            <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">Weather</span>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {WEATHERS.map((w) => (
                <OptionButton key={w} active={ambiance.weather === w} icon={WEATHER_ICON[w]} label={w} onClick={() => onChange({ weather: w })} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center">
              <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">Wind</span>
              <span className="font-body text-[16px] bg-secondary-container px-2 rounded">{windLabel(ambiance.wind)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambiance.wind}
              onChange={(e) => onChange({ wind: parseFloat(e.target.value) })}
              className="w-full mt-3 accent-primary"
              aria-label="Wind strength"
            />
            <div className="flex justify-between mt-1 font-label text-[10px] text-on-surface-variant uppercase">
              <span>Calm</span>
              <span>Windy</span>
            </div>
          </section>
        </div>

        <div className="p-6 border-t-2 border-primary/10">
          <button onClick={() => onChange({ ...DEFAULT_AMBIANCE })} className="w-full font-label text-[11px] text-on-surface-variant uppercase tracking-widest hover:underline">
            Reset to default
          </button>
        </div>
      </aside>
    </>
  );
}
