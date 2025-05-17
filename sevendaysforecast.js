import { cityName, lat, lon, api_key } from './geolocation.js';
import { weatherToday, renderAirConditions, renderUVandPrecipitation, renderHourlyForecast } from './weathertoday.js';
import { updateUVIndexForCity, updateUVDisplay } from './uv-index.js';


const WeatherCard = (weatherDay) => {
  const date = new Date(weatherDay.dt_txt);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `
    <div class="daily-item">
      <p class="today">${dayOfWeek}</p>
      <div class="weather-details">
        <div class="icon">
          <img src="https://openweathermap.org/img/wn/${weatherDay.weather[0]?.icon}@2x.png"
               alt="${weatherDay.weather[0]?.description}" />
        </div>
        <div class="description">${weatherDay.weather[0]?.description}</div>
      </div>
       <div class="right-section">
      <p class="temp">${Math.round(weatherDay.main.temp)}°C</p>
      <p class="high-low">${formattedDate}</p>
      </div>
    </div>`;
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;

  fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(data => {
       
        const todayWeather = data.list[0]; 

        // Inject today's weather conditions
         const todaycontainer = document.getElementById("current-weather");
        todaycontainer.innerHTML = weatherToday(todayWeather);
        
        document.querySelector('.conditions-grid').innerHTML = renderAirConditions(todayWeather);
       
        const uvIndex = updateUVIndexForCity(lat, lon);

        // First render UV and precipitation content
        document.querySelector('.uv-precipitation').innerHTML = renderUVandPrecipitation(todayWeather, uvIndex);

        // Then update the progress bar and text styling based on the real DOM
        updateUVDisplay(uvIndex);

        console.log(data);
       const today = new Date().getDate();
      const uniqueDays = [];

      // Filter forecasts to include 6 unique days starting from tomorrow
      const futureForecasts = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (forecastDate !== today && !uniqueDays.includes(forecastDate)) {
          uniqueDays.push(forecastDate);
          renderHourlyForecast(data.list);
          return uniqueDays.length <= 6;
        }
        return false;
      });

      // Show 5-day forecast
      const container = document.getElementById("daily-forecast");
      container.innerHTML = "";
        
      futureForecasts.forEach(weatherDay => {
        container.innerHTML += WeatherCard(weatherDay);
      });

            renderHourlyForecast(data.list);
    })
    .catch(err => {
      console.error("Weather fetch error:", err);
      alert("An error occurred while fetching the weather forecast!");
    });
};

export { getWeatherDetails };
