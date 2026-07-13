// The fixed background room: a consistent CSS-drawn wall, light beam, window,
// curtain, and weather overlay — graded by time of day. This replaces the
// mismatched background images with one coherent, tweakable scene.
export default function AmbianceScene({ ambiance }) {
  const { time, weather, wind } = ambiance;
  return (
    <div className="ambiance-root" data-time={time} data-weather={weather} style={{ "--wind": wind }} aria-hidden="true">
      <div className="ambiance-beam" />
      <div className="ambiance-window">
        <div className="ambiance-sun" />
        <div className="ambiance-curtain" />
      </div>
      <div className="ambiance-plant">🪴</div>

      {weather === "rain" && <div className="weather-layer weather-rain" />}
      {weather === "snow" && <div className="weather-layer weather-snow" />}
      {weather === "cloud" && <div className="weather-layer weather-cloud" />}
    </div>
  );
}
