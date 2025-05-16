import { getWeatherDetails } from './sevendaysforecast.js';


const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-search');
const errorMessage = document.getElementById('error-message'),
searchbtn = document.getElementById('location-btn');

const api_key = '953d16324765d01c29c55e30de9adba6';
const api_key_hourly = '9646d20e7fc4f7330a873106611279ac';

let cityName = '';
let lat = '';
let lon = '';


// Calculate and log UV Index
      const uvIndex = calculateUVIndex({ latitude: lat, longitude: lon });
      console.log(`UV Index for ${cityName}:`, uvIndex);

const getCityCoordinates = (event) => {
  if (event) event.preventDefault();

  cityName = cityInput.value.trim(); 
  cityInput.value = '';

  if (!cityName) {
    errorMessage.textContent = "Please enter a city name.";
    return;
  }

  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${api_key}`;

  fetch(GEOCODING_API_URL)
    .then(res => {
      if (!res.ok) throw new Error(`API returned status ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (!data.length) throw new Error(`No coordinates found for ${cityName}`);
      const { name, lat: newLat, lon: newLon} = data[0];

      cityName = name;
      lat = newLat;
      lon = newLon;
      

      getWeatherDetails(cityName, lat, lon);

      // Call hourly forecast after coordinates are available
      getHourlyForecast(lat, lon);
    })
    .catch(err => {
      console.error("Fetch error:", err);
      errorMessage.textContent = err.message || "An error occurred while fetching API coordinates!";
    });
};

const getHourlyForecast = (lat, lon) => {
  const HOURLY_FROM_DAILY_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;

  fetch(HOURLY_FROM_DAILY_API)
    .then(res => {
      if (!res.ok) throw new Error(`Hourly (fallback) API returned status ${res.status}`);
      return res.json();
    })
    .then(data => {
      const today = new Date().toDateString();

      const hourlyData = data.list.filter(item => {
        return new Date(item.dt_txt).toDateString() === today;
      }).slice(0, 6); // Limit to 6 time slots (approx. next 18 hours)

      console.log("Filtered hourly forecast:", hourlyData);

      // Optionally, render this:
      // renderHourlyForecast(hourlyData);
    })
    .catch(err => {
      console.error("Hourly fallback fetch error:", err);
    });
};


function calculateUVIndex(coordinates) {
  // Get current date and time
  const now = new Date()
  const month = now.getMonth() // 0-11
  const hour = now.getHours() // 0-23
  const latitude = Math.abs(coordinates.latitude)

  console.log("Calculating UV index for:", coordinates, "Month:", month, "Hour:", hour)

  // Adjust for southern hemisphere (opposite seasons)
  const isNorthernHemisphere = coordinates.latitude >= 0
  const adjustedMonth = isNorthernHemisphere ? month : (month + 6) % 12

  // Base UV index by month (northern hemisphere)
  // Higher in summer months (May-August), lower in winter
  const baseUVByMonth = [
    3, // January
    4, // February
    5, // March
    7, // April
    8, // May
    10, // June
    10, // July
    9, // August
    7, // September
    5, // October
    3, // November
    2, // December
  ]

  // Base UV for the current month
  const baseUV = baseUVByMonth[adjustedMonth]
  console.log("Base UV for month:", baseUV)

  // Adjust by time of day (peak at solar noon, around 12-13)
  // Using a bell curve approximation
  const hourFactor = Math.cos(((hour - 12.5) * Math.PI) / 12)
  const timeAdjustment = Math.max(0.1, hourFactor) // Ensure minimum of 0.1 even at night
  console.log("Time adjustment factor:", timeAdjustment)

  // Latitude adjustment factors
  // UV is highest near the equator and decreases toward the poles
  let latitudeAdjustment
  if (latitude < 20) {
    // Near equator: highest UV
    latitudeAdjustment = 1.2
  } else if (latitude < 37) {
    // Subtropical: high UV
    latitudeAdjustment = 1.0
  } else if (latitude < 50) {
    // Temperate: moderate UV
    latitudeAdjustment = 0.8
  } else {
    // Polar: low UV
    latitudeAdjustment = 0.6
  }
  console.log("Latitude adjustment factor:", latitudeAdjustment)

  // Calculate final UV index
  const uvIndex = baseUV * timeAdjustment * latitudeAdjustment
  console.log("Calculated UV index (raw):", uvIndex)

  // Round and ensure it's within 1-11 range (never zero)
  const finalUV = Math.min(11, Math.max(1, Math.round(uvIndex)))
  console.log("Final UV index (rounded):", finalUV)

  return finalUV
}

function getUVDescription(uvIndex) {
  if (uvIndex <= 2) return "Low";
  if (uvIndex <= 5) return "Moderate";
  if (uvIndex <= 7) return "High";
  if (uvIndex <= 10) return "Very High";
  return "Extreme";
}
searchbtn.addEventListener('click', getCityCoordinates);
form.addEventListener('submit', getCityCoordinates);
export { cityName, lat, lon, api_key, api_key_hourly,calculateUVIndex,getUVDescription};