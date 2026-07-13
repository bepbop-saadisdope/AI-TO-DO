// Ambiance = the room's mood (time of day, weather, wind). Purely a frontend
// concern, persisted to localStorage. No backend involvement.

const KEY = "pixido.ambiance";

export const TIMES = ["morning", "noon", "dusk", "night"];
export const WEATHERS = ["clear", "cloud", "rain", "snow"];

export const DEFAULT_AMBIANCE = { time: "morning", weather: "clear", wind: 0.15 };

export function loadAmbiance() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return { ...DEFAULT_AMBIANCE, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_AMBIANCE };
  }
}

export function saveAmbiance(ambiance) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ambiance));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function windLabel(wind) {
  if (wind < 0.2) return "Calm";
  if (wind < 0.5) return "Breeze";
  if (wind < 0.8) return "Gusty";
  return "Windy";
}
