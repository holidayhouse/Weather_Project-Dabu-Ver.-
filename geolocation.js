  import { getWeatherDetails } from './sevendaysforecast.js';
  import { updateUVIndexForCity } from './uv-index.js';
  import { renderHourlyForecast } from './weathertoday.js'; 

  const form = document.getElementById('search-form');
  const cityInput = document.getElementById('city-search');
  const errorMessage = document.getElementById('error-message');
  const searchbtn = document.getElementById('location-btn');

  const api_key = '953d16324765d01c29c55e30de9adba6';
  const api_key_hourly = '9646d20e7fc4f7330a873106611279ac';

  let cityName = '';
  let lat = '';
  let lon = '';

  const getCityCoordinates = (event) => {
    if (event) event.preventDefault();

      cityName = cityInput.value.trim(); 
      cityInput.value = '';

      if (!cityName || cityName.length < 2) {
      errorMessage.textContent = "Please enter a valid city name.";
      return;
    }else{
      errorMessage.textContent = '';

    }

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${api_key}`;

    fetch(GEOCODING_API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`API returned status ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!data.length) throw new Error(`No coordinates found for ${cityName}`);
        const { name, lat: newLat, lon: newLon } = data[0];

        cityName = name;
        lat = newLat;
        lon = newLon;

        getWeatherDetails(cityName, lat, lon);
        updateUVIndexForCity(lat, lon);
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
      if (!res.ok) throw new Error(`Hourly API returned status ${res.status}`);
      return res.json();
    })
    .then(data => {
      const weatherList = data.list; // 3-hour interval forecasts
      const timezoneOffset = data.city.timezone; // offset in seconds from UTC

      // Pass to rendering function
      renderHourlyForecast(weatherList, null, timezoneOffset);
    })
    .catch(err => {
      console.error("Hourly forecast fetch error:", err);
      const hourlyContainer = document.getElementById("hourly-forecast");
      if (hourlyContainer) {
        hourlyContainer.innerHTML = `<div class="forecast-item-server">Unable to load hourly forecast</div>`;
      }
    });
};

  // Add event listeners
  if (searchbtn) searchbtn.addEventListener('click', getCityCoordinates);
  if (form) form.addEventListener('submit', getCityCoordinates);

  export { cityName, lat, lon, api_key, api_key_hourly };