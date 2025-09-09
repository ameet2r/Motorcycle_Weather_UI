import { useState } from "preact/hooks";

export default function LocationForm({ onSubmit }) {
  const [locations, setLocations] = useState([
    { latitude: "", longitude: "", eta: "" },
  ]);

  // handle input change for a specific location
  const handleChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);
  };

  // add a new empty location
  const addLocation = () => {
    setLocations([...locations, { latitude: "", longitude: "", eta: "" }]);
  };

  // remove a location (but always keep at least one)
  const removeLocation = (index) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const coordinates = locations.map((loc) => {
      let obj = {
        latLng: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
      };
      if (loc.eta && loc.eta.trim() !== "") {
        obj.eta = loc.eta;
      }
      return obj;
    });

    const result = { coordinates };
    if (onSubmit) {
      onSubmit(result);
    }
  };

  return (
    <div>
      <h1>Locations Form</h1>

      <form onSubmit={handleSubmit}>
        {locations.map((loc, index) => (
          <div key={index}>
            <div>
              <input
                type="text"
                placeholder="Latitude"
                value={loc.latitude}
                onInput={(e) => handleChange(index, "latitude", e.target.value)}
              />
              <input
                type="text"
                placeholder="Longitude"
                value={loc.longitude}
                onInput={(e) => handleChange(index, "longitude", e.target.value)}
              />
              <input
                type="text"
                placeholder="ETA (optional)"
                value={loc.eta}
                onInput={(e) => handleChange(index, "eta", e.target.value)}
              />
            </div>

            <div>
              {locations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                >
                  Remove
                </button>
              )}
              {index === locations.length - 1 && (
                <button
                  type="button"
                  onClick={addLocation}
                >
                  + Add Location
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}