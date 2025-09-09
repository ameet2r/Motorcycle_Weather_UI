import { useState } from "preact/hooks";

export default function WeatherCard(location, forecast) {
  if (!location && !forecast) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4 bg-blue-100 rounded shadow m-2">
      <h2 className="text-xl font-bold">{location}</h2>
      <ForecastCard {...forecast} />
    </div>
  );
}


function ForecastCard(forecast) {
  const [expanded, setExpanded] = useState(false);

  if (!forecast) return <div>Loading forecast...</div>;

  return (
    <div className="p-4 bg-green-100 rounded shadow m-2">
      <h2 className="text-xl font-bold mb-2">Elevation: {forecast.elevation ?? "N/A"} ft</h2>

      <button
        onClick={() => setExpanded(!expanded)}
        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
      >
        {expanded ? "Hide Periods" : `Show ${forecast.periods.length} Periods`}
      </button>

      {expanded && (
        <div className="space-y-2">
          {forecast.periods.map((period, idx) => (
            <PeriodCard key={idx} {...period} />
          ))}
        </div>
      )}
    </div>
  );
}
function PeriodCard(period) {
  if (!period) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4 bg-blue-100 rounded shadow m-2">
      <h2 className="text-xl font-bold">{period.name ?? "No Name"}</h2>
      <p>{period.start_time ?? "No start time"}</p>
      <p>{period.end_time ?? "No end time"}</p>
      <p>{period.icon ?? "No icon"}</p>
      <p>{period.is_day_time ?? false}</p>
      <p>{period.probability_of_precip ?? 0}</p>
      <p>{period.short_forecast ?? "No short forecast"}</p>
      <p>{period.detailed_forecast ?? "No detailed Forecast"}</p>
      <p>{period.temperature ?? 0}</p>
      <p>{period.wind_direction ?? "No wind"}</p>
      <p>{period.wind_speed ?? "No speed"}</p>
    </div>
  );
}



