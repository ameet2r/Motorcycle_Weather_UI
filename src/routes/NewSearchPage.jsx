import { useState } from "preact/hooks";
import WeatherCard from "../components/WeatherCard";
import LocationForm from "../components/LocationForm";

export default function NewSearchPage() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchWeather(locations) {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/CoordinatesToWeather/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(locations),
        });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const map = result.coordinates_to_forecasts_map;

      // Create an array of forecast objects for all keys
      const forecastArray = Object.entries(map).flatMap(([key, forecastsForKey]) => {
        return forecastsForKey.map(forecast => ({
          key,       // keep track of the lat:lng key if you want
          ...forecast
        }));
      });

      setForecasts(forecastArray);
    } catch (err) {
      console.error("Error fetching weather:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <LocationForm onSubmit={fetchWeather}/>
      <button
        onClick={fetchWeather}
      >
        Fetch Weather
      </button>

      {loading && <p>Loading...</p>}
      <div>
        <h2>Forecasts:</h2>
        {forecasts.map((forecast, idx) => (
          <div key={idx}>
            <h3>{forecast.key} (Elevation: {forecast.elevation} ft)</h3>
            <ul>
              {forecast.periods.map((period, pIdx) => (
                <li key={pIdx}>
                  <strong>{period.name}</strong> ({period.start_time} to {period.end_time})<br />
                  Temp: {period.temperature} °F, {period.short_forecast}<br />
                  Wind: {period.wind_direction} {period.wind_speed}<br />
                  Precip: {period.probability_of_precip ?? 0}%<br />
                  Detailed Forecast: {period.detailed_forecast ?? ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

