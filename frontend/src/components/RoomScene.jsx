// Code-drawn room (inline SVG), themed by time of day. No image assets.
// Lighting logic:
//   - Sun/moon + the light shaft appear ONLY when the sky is clear.
//   - Cloud/Rain/Snow are overcast: clouds cover the sky, no sun, no shaft.
//     Rain = clouds + rain; Snow = clouds + snow.
//   - Sun/moon sit on the RIGHT of the window, so light enters going down-left
//     into the room; the plant on the sill casts a shadow within the shaft.
export default function RoomScene({ ambiance }) {
  const { time, weather, wind } = ambiance;
  const sky = { x: 111, y: 15, w: 34, h: 42 };
  const clear = weather === "clear";
  const overcast = !clear; // cloud / rain / snow

  // Light shaft = the open (uncurtained) window opening projected onto the floor
  // along the sun direction. Sun is upper-RIGHT, so the shaft leans down-LEFT.
  // Computing the corners from one shear keeps both sides parallel -> it always
  // reads as a real projection, not a shape that slides when a number changes.
  const beamPoints = (() => {
    const left = 120, right = 145, top = 16, floorY = 100, shear = 0.42;
    const dx = shear * (floorY - top);
    return `${left},${top} ${right},${top} ${(right - dx).toFixed(1)},${floorY} ${(left - dx).toFixed(1)},${floorY}`;
  })();

  // Pixel sun/moon: a blocky disc (rows -> stepped circle edge) at this spot.
  const SUN = { cx: 137, cy: 27 };
  const discRows = [
    [-3, 1.5], [-2, 2.8], [-1, 3.4], [0, 3.5], [1, 3.4], [2, 2.8], [3, 1.5],
  ];
  const RAYS = [
    [0, -1], [0, 1], [1, 0], [-1, 0],
    [0.7, -0.7], [-0.7, -0.7], [0.7, 0.7], [-0.7, 0.7],
  ];
  // A filled pixel disc, optionally offset (used to stack shaded layers).
  const disc = (fill, dx = 0, dy = 0) => (
    <g fill={fill}>
      {discRows.map(([ry, hw], i) => (
        <rect key={i} x={SUN.cx - hw + dx} y={SUN.cy + ry + dy} width={hw * 2} height="1" />
      ))}
    </g>
  );

  return (
    <div className="room-scene" data-time={time} style={{ "--wind": wind }} aria-hidden="true">
      <svg className="room-svg" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges">
        <defs>
          {/* Two rain layers: scattered streaks, different tile sizes + speeds. */}
          <pattern id="wx-rain-near" width="13" height="16" patternUnits="userSpaceOnUse">
            <rect x="1" y="0" width="0.7" height="4" fill="#cdd8e6" opacity="0.85" />
            <rect x="4" y="2" width="0.7" height="3" fill="#cdd8e6" opacity="0.6" />
            <rect x="6.5" y="7" width="0.7" height="5" fill="#cdd8e6" opacity="0.8" />
            <rect x="9" y="1" width="0.7" height="3" fill="#cdd8e6" opacity="0.55" />
            <rect x="11" y="5" width="0.7" height="4" fill="#cdd8e6" opacity="0.7" />
            <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 16" dur="0.5s" repeatCount="indefinite" />
          </pattern>
          <pattern id="wx-rain-far" width="11" height="14" patternUnits="userSpaceOnUse">
            <rect x="2" y="3" width="0.6" height="3" fill="#cdd8e6" opacity="0.4" />
            <rect x="7" y="8" width="0.6" height="4" fill="#cdd8e6" opacity="0.45" />
            <rect x="9.5" y="0" width="0.6" height="2" fill="#cdd8e6" opacity="0.35" />
            <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 14" dur="0.78s" repeatCount="indefinite" />
          </pattern>
          <pattern id="wx-snow" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="4" r="0.9" fill="#ffffff" />
            <circle cx="9" cy="9" r="1.1" fill="#ffffff" />
            <circle cx="12" cy="3" r="0.7" fill="#ffffff" />
            <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 14" dur="4s" repeatCount="indefinite" />
          </pattern>
          <clipPath id="skyClip">
            <rect x={sky.x} y={sky.y} width={sky.w} height={sky.h} />
          </clipPath>
        </defs>

        {/* Wall + soft light */}
        <rect className="rs-wall" x="0" y="0" width="160" height="78" />
        <ellipse cx="120" cy="34" rx="46" ry="34" fill="rgba(255,255,255,0.12)" />
        <circle cx="18" cy="58" r="24" fill="var(--glow)" />

        {/* Floor */}
        <rect className="rs-floor" x="0" y="78" width="160" height="22" />
        <rect className="rs-floor2" x="0" y="78" width="160" height="3" />
        {[16, 40, 72, 104, 132].map((x) => (
          <line key={x} className="rs-line" x1={x} y1="81" x2={x - 6} y2="100" />
        ))}

        {/* Sun/moon light shaft — clear sky only. Full light, no obstruction. */}
        {clear && <polygon className="rs-beam" points={beamPoints} />}
        {/* Extra light: fills from the main shaft's right edge over to the
            window's right corner and down (to the red line). Separate block so
            the shaft above stays untouched. */}
        {clear && <polygon className="rs-beam" points="127.78,57 145,57 129,100 109.72,100" />}

        {/* Window opening: sky, then sun/weather (seen through glass), then frame */}
        <rect className="rs-sky" x={sky.x} y={sky.y} width={sky.w} height={sky.h} />

        {/* Clear sky: 16-bit sun (day) / moon (night) — smaller, cleanly shaded */}
        {clear && time !== "night" && (
          <g>
            {/* rays: each has a fixed base pixel on a ring; pixels grow outward
                to a set length then retract back. Skipped at dusk (sun is setting). */}
            {time !== "dusk" && RAYS.map(([dx, dy], i) => {
              const R = 4; // base-pixel distance from the sun center
              const bx = SUN.cx + dx * R;
              const by = SUN.cy + dy * R;
              const angle = (Math.atan2(dx, -dy) * 180) / Math.PI; // point local "up" outward
              return (
                <g key={i} transform={`translate(${bx.toFixed(2)} ${by.toFixed(2)}) rotate(${angle.toFixed(1)})`}>
                  <polygon
                    className="ray-grow"
                    points="-0.7,0 0.7,0 0.7,-1.8 0,-3 -0.7,-1.8"
                    fill="#ffab33"
                  />
                </g>
              );
            })}
            {/* disc + shading, nudged up 0.5 so it centers on the ray ring */}
            <g transform="translate(0 -0.5)">
              {disc("#ffcf4d")}
              <g fill="#eea23a">
                <rect x={SUN.cx - 3.4} y={SUN.cy + 1} width="6.8" height="1" />
                <rect x={SUN.cx - 2.8} y={SUN.cy + 2} width="5.6" height="1" />
                <rect x={SUN.cx - 1.5} y={SUN.cy + 3} width="3" height="1" />
              </g>
              <g fill="#fff2b0">
                <rect x={SUN.cx - 2.3} y={SUN.cy - 2.6} width="2" height="1.6" />
              </g>
            </g>
          </g>
        )}
        {clear && time === "night" && (
          <g>
            <g transform="translate(0 -0.5)">
              {disc("#dfe4f2")}
              <g fill="#c2c9de">
                <rect x={SUN.cx - 3.4} y={SUN.cy + 1} width="6.8" height="1" />
                <rect x={SUN.cx - 2.8} y={SUN.cy + 2} width="5.6" height="1" />
                <rect x={SUN.cx - 1.5} y={SUN.cy + 3} width="3" height="1" />
              </g>
              <g fill="#ffffff">
                <rect x={SUN.cx - 2.3} y={SUN.cy - 2.4} width="1.8" height="1.4" />
              </g>
              {/* craters */}
              <g fill="#aeb6d2">
                <rect x={SUN.cx - 1.5} y={SUN.cy - 1.5} width="1.8" height="1.8" />
                <rect x={SUN.cx + 1} y={SUN.cy + 0.3} width="1.4" height="1.4" />
                <rect x={SUN.cx - 0.6} y={SUN.cy + 1.6} width="1.2" height="1.2" />
              </g>
            </g>
          </g>
        )}
        {clear && time === "night" && (
          <g clipPath="url(#skyClip)" fill="#eef1ff" opacity="0.85">
            <circle cx="116" cy="20" r="0.5" />
            <circle cx="124" cy="24" r="0.4" />
            <circle cx="119" cy="44" r="0.4" />
            <circle cx="130" cy="49" r="0.5" />
            <circle cx="141" cy="46" r="0.4" />
          </g>
        )}

        {/* Overcast (cloud/rain/snow): grey the sky + clouds */}
        {overcast && (
          <g clipPath="url(#skyClip)">
            <rect x={sky.x} y={sky.y} width={sky.w} height={sky.h} fill="rgba(120,124,132,0.35)" />
            <g fill="rgba(236,238,242,0.9)">
              <g>
                <ellipse cx="120" cy="23" rx="10" ry="3.6" />
                <ellipse cx="127" cy="21" rx="7" ry="3" />
                <animateTransform attributeName="transform" type="translate" values="-4 0; 4 0; -4 0" dur="16s" repeatCount="indefinite" />
              </g>
              <g fill="rgba(210,214,222,0.9)">
                <ellipse cx="134" cy="30" rx="8" ry="3.2" />
                <animateTransform attributeName="transform" type="translate" values="5 0; -5 0; 5 0" dur="22s" repeatCount="indefinite" />
              </g>
            </g>
          </g>
        )}

        {/* Rain implies clouds (above) + falling rain */}
        {weather === "rain" && (
          <g clipPath="url(#skyClip)">
            <rect x={sky.x} y={sky.y} width={sky.w} height={sky.h} fill="url(#wx-rain-far)" />
            <rect x={sky.x} y={sky.y} width={sky.w} height={sky.h} fill="url(#wx-rain-near)" />
          </g>
        )}
        {/* Snow implies clouds (above) + falling snow */}
        {weather === "snow" && <rect x={sky.x} y={sky.y} width={sky.w} height={sky.h} fill="url(#wx-snow)" opacity="0.9" />}

        {/* Window frame (over the sky/weather) */}
        <rect className="rs-frame" x="106" y="58" width="44" height="4" />
        <rect className="rs-frame" x="127" y="15" width="1.6" height="42" />
        <rect className="rs-frame" x="111" y="35" width="34" height="1.6" />
        <rect x="108" y="12" width="40" height="48" fill="none" stroke="var(--frame)" strokeWidth="3" />

        {/* Baseboard */}
        <rect className="rs-frame" x="0" y="76" width="160" height="2" opacity="0.5" />

        {/* Curtain — tied-back drape on a rod, LEFT side only. Upper lobe is
            fixed; the lower lobe billows from the tieback (see .curtain-hem). */}
        <g>
          {/* rod + finials (left as before, right end extended a little) */}
          <rect className="rs-frame" x="102" y="7.4" width="51" height="1.7" />
          <circle className="rs-frame" cx="102" cy="8.2" r="1.7" />
          <circle className="rs-frame" cx="153" cy="8.2" r="1.7" />

          {/* upper lobe: rod -> tieback pinch */}
          <path className="rs-curtain" d="M103,9 C101,16 100,24 102,30 C104,34 106,36 108,37 L114,37 C116,35 118,33 119,29 C121,23 120,16 119,9 Z" />
          <path d="M107,10 C105,18 104,26 107,35" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
          <path d="M111,10 C110,19 111,27 112,35" stroke="rgba(60,54,72,0.13)" strokeWidth="1.1" fill="none" />
          <path d="M116,10 C117,18 117,26 116,34" stroke="rgba(60,54,72,0.10)" strokeWidth="1" fill="none" />

          {/* lower lobe: clean rounded drape, folds kept inside the body */}
          <g className="curtain-hem">
            <path className="rs-curtain" d="M109,37 C105,42 103,47 105,52 C108,54 113,54 116,52 C118,47 116,42 114,37 Z" />
            <path d="M110,39 C108,44 107,49 108,52" stroke="rgba(255,255,255,0.36)" strokeWidth="1.1" fill="none" />
            <path d="M112,39 C112,45 112,49 112,52" stroke="rgba(60,54,72,0.12)" strokeWidth="1" fill="none" />
            <path d="M114,40 C115,44 114,48 114,51" stroke="rgba(60,54,72,0.10)" strokeWidth="0.9" fill="none" />
          </g>

          {/* tieback band — fabric cord (not the wooden frame colour) */}
          <rect x="106.5" y="35.5" width="9" height="3" rx="1.2" fill="#caa14a" />
          <rect x="106.5" y="37" width="9" height="0.9" rx="0.4" fill="rgba(90,60,20,0.28)" />
        </g>

        {/* Potted plant — pot stays still; only the leaves rustle */}
        <g>
          <g className="svg-plant">
            <path className="rs-leaf" d="M17,86 C15,73 16,63 18,57 C19,67 18,77 18,86 Z" />
            <path className="rs-leaf2" d="M17,86 C23,73 25,63 21,56 C19,66 18,76 17,86 Z" />
            <path className="rs-leaf2" d="M17,86 C9,77 5,69 8,62 C12,71 15,79 17,86 Z" />
            <path className="rs-leaf" d="M17,86 C25,78 29,71 26,64 C22,73 19,80 17,86 Z" />
            <path className="rs-leaf" d="M17,86 C12,74 11,64 15,57 C17,66 18,76 18,86 Z" />
          </g>
          <path className="rs-pot" d="M10,85 L25,85 L23,97 L12,97 Z" />
          <rect className="rs-pot" x="9" y="83" width="17" height="3" />
        </g>
      </svg>
    </div>
  );
}
