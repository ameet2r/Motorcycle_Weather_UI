import { useState } from "preact/hooks";

export default function LocationForm({ onSubmit }) {
  const [locations, setLocations] = useState([
    { latitude: "", longitude: ""},
  ]);
  const [errors, setErrors] = useState([]);

  // handle input change for a specific location
  const handleChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);

    // Validate location and longitude values
    // const newErrors = [...errors];
    const newErrors = newLocations.map(validateLocation);
    // newErrors[index] = validateLocation(newLocations[index]);
    setErrors(newErrors);
  };

  // add a new empty location
  const addLocation = () => {
    setLocations([...locations, { latitude: "", longitude: ""}]);
    setErrors([...errors, {}]);
  };

  // remove a location (but always keep at least one)
  const removeLocation = (index) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
      setErrors(errors.filter((_, i) => i !== index));
    }
  };

  const floatRegex = /^-?\d+(\.\d+)?$/;
  const validateLocation = (location) => {
    const error = {};

    if (!floatRegex.test(location.latitude)) {
      error.latitude = "Latitude must be a valid number";
    } else {
      const latitude = parseFloat(location.latitude);
      if (latitude < -90 || latitude > 90) {
        error.latitude = "Latitude must be between -90 and 90";
      }
    }

    if (!floatRegex.test(location.longitude)) {
      error.longitude = "Longitude must be a valid number";
    } else {
      const longitude = parseFloat(location.longitude);
      if (longitude < -180 || longitude > 180) {
        error.longitude = "Longitude must be between -180 and 180";
      }
    }

    return error;
  };

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all locations
    const newErrors = locations.map(validateLocation);
    setErrors(newErrors);

    // Check if any errors exist
    const hasErrors = newErrors.some(
      (err) => err.latitude || err.longitude
    );

    if (hasErrors) return;

    const coordinates = locations.map((loc) => {
      let obj = {
        latLng: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
      };
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
              {errors[index]?.latitude && (
                <span style={{ color: "red", marginLeft: "8px" }}>
                  {errors[index].latitude}
                </span>
              )}
              <input
                type="text"
                placeholder="Longitude"
                value={loc.longitude}
                onInput={(e) => handleChange(index, "longitude", e.target.value)}
              />
              {errors[index]?.longitude && (
                <span style={{ color: "red", marginLeft: "8px" }}>
                  {errors[index].longitude}
                </span>
              )}
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
          disabled={errors.some(error => error.latitude || error.longitude)}
        >
          Submit
        </button>
      </form>
    </div>
  );
}