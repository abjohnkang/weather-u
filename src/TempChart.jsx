import { useState } from 'react'

// 24-hour temperature line. Single series → no legend; the heading names it.
// Dependency-free inline SVG so the app stays tiny. Draws in a fixed viewBox
// and scales to its container width via CSS.
const VIEW_W = 640
const VIEW_H = 220
const PAD = { top: 24, right: 16, bottom: 28, left: 34 }

// Pick the 24 hourly readings starting at the current hour.
function next24(hourly, currentTime) {
  if (!hourly?.time?.length) return []
  const key = currentTime.slice(0, 13) // "YYYY-MM-DDTHH"
  let start = hourly.time.findIndex(t => t.slice(0, 13) === key)
  if (start < 0) start = 0
  return hourly.time.slice(start, start + 24).map((t, i) => ({
    time: t,
    temp: hourly.temperature_2m[start + i],
  }))
}

function niceHour(iso) {
  const h = new Date(iso).getHours()
  const period = h < 12 ? 'AM' : 'PM'
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}${period}`
}

export default function TempChart({ hourly, currentTime, unit, toDisplay }) {
  const [hover, setHover] = useState(null)

  const points = next24(hourly, currentTime)
  if (points.length < 2) return null

  const temps = points.map(p => toDisplay(p.temp, unit))
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  // Pad the domain so the line never rides the top/bottom edge.
  const lo = min - 2
  const hi = max + 2
  const span = hi - lo || 1

  const plotW = VIEW_W - PAD.left - PAD.right
  const plotH = VIEW_H - PAD.top - PAD.bottom
  const x = i => PAD.left + (i / (points.length - 1)) * plotW
  const y = t => PAD.top + (1 - (t - lo) / span) * plotH

  const coords = temps.map((t, i) => ({ x: x(i), y: y(t), t, iso: points[i].time }))
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const areaPath =
    `M${coords[0].x},${y(lo)} ` +
    coords.map(c => `L${c.x},${c.y}`).join(' ') +
    ` L${coords[coords.length - 1].x},${y(lo)} Z`

  const minIdx = temps.indexOf(min)
  const maxIdx = temps.indexOf(max)

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * VIEW_W
    let nearest = 0
    let best = Infinity
    for (let i = 0; i < coords.length; i++) {
      const d = Math.abs(coords[i].x - px)
      if (d < best) { best = d; nearest = i }
    }
    setHover(nearest)
  }

  const hc = hover != null ? coords[hover] : null

  return (
    <svg
      className="temp-chart"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="24-hour temperature forecast"
      onMouseMove={handleMove}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* recessive gridlines: lo / mid / hi */}
      {[lo, (lo + hi) / 2, hi].map((gv, i) => (
        <g key={i}>
          <line
            className="grid"
            x1={PAD.left}
            x2={VIEW_W - PAD.right}
            y1={y(gv)}
            y2={y(gv)}
          />
          <text className="axis-label" x={PAD.left - 6} y={y(gv) + 3} textAnchor="end">
            {Math.round(gv)}°
          </text>
        </g>
      ))}

      {/* x-axis hour labels every 6 hours */}
      {coords.map((c, i) =>
        i % 6 === 0 ? (
          <text key={i} className="axis-label" x={c.x} y={VIEW_H - 10} textAnchor="middle">
            {i === 0 ? 'Now' : niceHour(c.iso)}
          </text>
        ) : null
      )}

      <path d={areaPath} fill="url(#tempFill)" />
      <path d={linePath} className="temp-line" fill="none" />

      {/* min / max direct labels */}
      <text className="peak-label" x={coords[maxIdx].x} y={coords[maxIdx].y - 8} textAnchor="middle">
        {max}°
      </text>
      <text className="peak-label low" x={coords[minIdx].x} y={coords[minIdx].y + 16} textAnchor="middle">
        {min}°
      </text>

      {/* hover crosshair + tooltip */}
      {hc && (
        <g>
          <line className="crosshair" x1={hc.x} x2={hc.x} y1={PAD.top} y2={VIEW_H - PAD.bottom} />
          <circle className="hover-dot" cx={hc.x} cy={hc.y} r="4" />
          <g transform={`translate(${Math.min(Math.max(hc.x, PAD.left + 30), VIEW_W - PAD.right - 30)}, ${PAD.top - 6})`}>
            <text className="tooltip-text" textAnchor="middle">
              {hover === 0 ? 'Now' : niceHour(hc.iso)} · {hc.t}°{unit}
            </text>
          </g>
        </g>
      )}
    </svg>
  )
}
