import { cityName , calculateUVIndex,getUVDescription } from './geolocation.js';


const weatherToday = (weatherDay) => {
   const weatherMain = weatherDay.weather[0].main.toLowerCase();
    let bgClass = 'default';

    switch (weatherMain) {
        case 'clear':
            bgClass = 'clear';
            break;
        case 'clouds':
            bgClass = 'clouds';
            break;
        case 'rain':
        case 'drizzle':
            bgClass = 'rain';
            break;
        case 'thunderstorm':
            bgClass = 'thunderstorm';
            break;
        case 'snow':
            bgClass = 'snow';
            break;
    }

    // Apply the background class to the current weather container
    const weatherContainer = document.getElementById("current-weather");
    if (weatherContainer) {
        weatherContainer.className = `current-weather ${bgClass}`;
    }

    return `  
    <div class="weather-info">
        <h1 id="location">${cityName}</h1>
        <p id="rain-chance">Chance of rain: ${Math.round(weatherDay.pop * 100)}%</p>
        <h2 id="current-temp">${(weatherDay.main.temp)}°C</h2>
    </div>
    <div class="weather-icon">
        <img src="https://openweathermap.org/img/wn/${weatherDay.weather[0].icon}@2x.png"
             alt="${weatherDay.weather[0].description}" />
    </div>
  `;
  
};

const renderAirConditions = (weatherDay) => `
  <div class="condition-item">
      <div class="condition-icon"><i class="fas fa-temperature-high"></i></div>
      <p class="condition-label">Real Feel</p>
      <p class="condition-value" id="real-feel">${weatherDay.main.feels_like}°C</p>
  </div>
  <div class="condition-item">
      <div class="condition-icon"><i class="fas fa-wind"></i></div>
      <p class="condition-label">Wind</p>
      <p class="condition-value" id="wind-speed">${weatherDay.wind.speed} km/h</p>
  </div>
  <div class="condition-item">
      <div class="condition-icon"><i class="fas fa-tint"></i></div>
      <p class="condition-label">Humidity</p>
      <p class="condition-value" id="rain-probability">${weatherDay.main.humidity}%</p>
  </div>
  <div class="condition-item">
      <div class="condition-icon"><i class="fa-sharp fa-solid fa-water" "></i></div>
      <p class="condition-label">Sea Level</p>
      <p class="condition-value" id="uv-index">${weatherDay.main.pressure} hPa</p>
  </div>
`;

const renderUVandPrecipitation = (weatherDay, lat, lon) => {
  const uvIndex = calculateUVIndex({ latitude: lat, longitude: lon });
  const uvDescription = getUVDescription(uvIndex);
  const uvPercentage = (uvIndex / 11) * 100;

  return `
  <div class="uv-container">
      <div class="uv-header">
          <i class="fas fa-sun"></i><span>UV Index</span>
      </div>
      <div class="uv-content">
          <p class="uv-value" id="uv-value">${uvIndex}</p>
          <p class="uv-description" id="uv-description">${uvDescription}</p>
          <div class="progress-container">
              <div class="progress-bar" id="uv-progress" style="width: ${uvPercentage}%;"></div>
          </div>
      </div>
  </div>
  <div class="precip-container">
      <div class="precip-header">
          <i class="fa-solid fa-cloud"></i><span>Cloudiness</span>
      </div>
      <div class="precip-content">
          <p class="precip-value" id="precip-value">${weatherDay.clouds.all}%</p>
      </div>
  </div>
  `;
};
const renderHourlyForecast = (weatherList) => {
  const now = new Date();
  const todayDateStr = now.toDateString();
  const tomorrowDateStr = new Date(now.setDate(now.getDate() + 1)).toDateString();

  // Filter forecast entries for today and tomorrow
  const todayForecasts = weatherList.filter(item =>
    new Date(item.dt_txt).toDateString() === todayDateStr
  );

  const tomorrowForecasts = weatherList.filter(item =>
    new Date(item.dt_txt).toDateString() === tomorrowDateStr
  );

  // Combine and limit to 6
  const hourlyForecast = [...todayForecasts, ...tomorrowForecasts].slice(0, 6);

  const hourlyContainer = document.getElementById("hourly-forecast");
  if (!hourlyContainer) return;

  hourlyContainer.innerHTML = "";

  hourlyForecast.forEach(hourData => {
    const hour = new Date(hourData.dt_txt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    hourlyContainer.innerHTML += `
      <div class="forecast-item-server">
        <div class="server-time">${hour}</div>
        <img class="server-icon" src="https://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png" alt="weather icon">
        <div class="server-description">${hourData.weather[0].description}</div>
        <div class="server-temp">${Math.round(hourData.main.temp)}°</div>
      </div>
    `;
  });
};


export { weatherToday, renderAirConditions, renderUVandPrecipitation,  renderHourlyForecast };

