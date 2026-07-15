import { useState, useEffect } from 'react'
import './App.css'

const COLLEGES = [
  { name: 'UIUC', location: 'Champaign-Urbana, IL', lat: 40.1106, lon: -88.2073, timezone: 'America/Chicago' },
  { name: 'MIT', location: 'Cambridge, MA', lat: 42.3601, lon: -71.0942, timezone: 'America/New_York' },
  { name: 'Stanford', location: 'Stanford, CA', lat: 37.4275, lon: -122.1697, timezone: 'America/Los_Angeles' },
  { name: 'Harvard', location: 'Cambridge, MA', lat: 42.3770, lon: -71.1167, timezone: 'America/New_York' },
  { name: 'UCLA', location: 'Los Angeles, CA', lat: 34.0689, lon: -118.4452, timezone: 'America/Los_Angeles' },
  { name: 'UC Berkeley', location: 'Berkeley, CA', lat: 37.8719, lon: -122.2585, timezone: 'America/Los_Angeles' },
  { name: 'Georgia Tech', location: 'Atlanta, GA', lat: 33.7756, lon: -84.3963, timezone: 'America/New_York' },
  { name: 'UT Austin', location: 'Austin, TX', lat: 30.2849, lon: -97.7341, timezone: 'America/Chicago' },
  { name: 'UMich', location: 'Ann Arbor, MI', lat: 42.2780, lon: -83.7382, timezone: 'America/New_York' },
  { name: 'Carnegie Mellon', location: 'Pittsburgh, PA', lat: 40.4433, lon: -79.9436, timezone: 'America/New_York' },
]

const WMO_CODES = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌦️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snowfall', icon: '🌨️' },
  73: { description: 'Moderate snowfall', icon: '🌨️' },
  75: { description: 'Heavy snowfall', icon: '❄️' },
  77: { description: 'Snow grains', icon: '❄️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '🌧️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

function getWeatherInfo(code) {
  return WMO_CODES[code] || { description: 'Unknown', icon: '❓' }
}

function App() {
  const [selectedCollege, setSelectedCollege] = useState(COLLEGES[0])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchWeather(selectedCollege, controller.signal)
    return () => controller.abort()
  }, [selectedCollege, reloadKey])

  async function fetchWeather(college, signal) {
    setLoading(true)
    setError(null)
    try {
      const tz = encodeURIComponent(college.timezone)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${college.lat}&longitude=${college.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7&timezone=${tz}`
      const res = await fetch(url, { signal })
      if (!res.ok) throw new Error('Failed to fetch weather data')
      const data = await res.json()
      setWeather(data)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  function reload() {
    setReloadKey(k => k + 1)
  }

  function handleCollegeChange(e) {
    const college = COLLEGES.find(c => c.name === e.target.value)
    if (college) setSelectedCollege(college)
  }

  if (loading) {
    return <div className="container"><p className="loading">Loading weather...</p></div>
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">Error: {error}</p>
        <button onClick={reload}>Retry</button>
      </div>
    )
  }

  const current = weather.current
  const daily = weather.daily
  const info = getWeatherInfo(current.weather_code)

  return (
    <div className="container">
      <div className="college-selector">
        <select value={selectedCollege.name} onChange={handleCollegeChange}>
          {COLLEGES.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <h1>{selectedCollege.name} Weather</h1>
      <p className="subtitle">{selectedCollege.location}</p>

      <div className="current-weather">
        <div className="weather-icon">{info.icon}</div>
        <div className="temperature">{Math.round(current.temperature_2m)}°F</div>
        <div className="description">{info.description}</div>
        <div className="details">
          <div className="detail">
            <span className="label">Feels like</span>
            <span className="value">{Math.round(current.apparent_temperature)}°F</span>
          </div>
          <div className="detail">
            <span className="label">Humidity</span>
            <span className="value">{current.relative_humidity_2m}%</span>
          </div>
          <div className="detail">
            <span className="label">Wind</span>
            <span className="value">{Math.round(current.wind_speed_10m)} mph</span>
          </div>
        </div>
      </div>

      <h2>7-Day Forecast</h2>
      <div className="forecast">
        {daily.time.map((date, i) => {
          const dayInfo = getWeatherInfo(daily.weather_code[i])
          const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
          return (
            <div className="forecast-day" key={date}>
              <div className="day-name">{i === 0 ? 'Today' : dayName}</div>
              <div className="day-icon">{dayInfo.icon}</div>
              <div className="day-temps">
                <span className="high">{Math.round(daily.temperature_2m_max[i])}°</span>
                <span className="low">{Math.round(daily.temperature_2m_min[i])}°</span>
              </div>
            </div>
          )
        })}
      </div>

      <button className="refresh-btn" onClick={reload}>Refresh</button>
    </div>
  )
}

export default App
