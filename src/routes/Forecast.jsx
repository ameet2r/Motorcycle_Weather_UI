import { useState } from "preact/hooks";
import WeatherCard from "../components/WeatherCard";

export default function Forecast() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchForecast() {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/CoordinatesToWeather/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            {
              latLng: {
                latitude: "37.4258",
                longitude: "-122.09865"
              }
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Map API response to props WeatherCard expects
      const mappedForecast = result.map(day => ({
        location: day.city ?? "Unknown location",
        temp: day.temperature_celsius ?? "N/A",
        condition: day.condition ?? "N/A",
      }));

      setForecast(mappedForecast);
    } catch (err) {
      console.error("Error fetching forecast:", err);
      setForecast([
        { location: "Error", temp: "N/A", condition: err.message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Forecast</h1>
      <button
        onClick={fetchForecast}
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Fetch Forecast
      </button>

      {loading && <p class="mt-4">Loading...</p>}

      <div class="mt-4 space-y-2">
        {forecast.map((day, idx) => (
          <WeatherCard key={idx} {...day} />
        ))}
      </div>
    </div>
  );
}
