import { cityName } from './geolocation.js';

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
        <h2 id="current-temp">${(weatherDay.main.temp.toFixed())}°C</h2>
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

const renderHourlyForecast = (weatherList, currentForecast, timezoneOffset = 0) => {
  const hourlyContainer = document.getElementById("hourly-forecast");
  if (!hourlyContainer) return;

  hourlyContainer.innerHTML = "";

  const nowUTCSeconds = Math.floor(Date.now() / 1000);
  const nowLocalSeconds = nowUTCSeconds + timezoneOffset;

  const futureForecasts = [];

  // Step 1: Get next 6 future forecast blocks
  for (const item of weatherList) {
    const forecastUTC = item.dt;
    const forecastLocal = forecastUTC + timezoneOffset;

    if (forecastLocal > nowLocalSeconds) {
      futureForecasts.push({
        ...item,
        localTime: forecastLocal * 1000, // in ms
      });
    }

    if (futureForecasts.length >= 6) break;
  }

  // Step 2: If less than 6 found, keep adding later ones
  if (futureForecasts.length < 6) {
    for (const item of weatherList) {
      const forecastUTC = item.dt;
      const forecastLocal = forecastUTC + timezoneOffset;

      if (
        forecastLocal <= nowLocalSeconds ||
        futureForecasts.find(f => f.dt === item.dt)
      ) continue;

      futureForecasts.push({
        ...item,
        localTime: forecastLocal * 1000, // in ms
      });

      if (futureForecasts.length >= 6) break;
    }
  }

  // Step 3: Show message if nothing to render
  if (futureForecasts.length === 0) {
    hourlyContainer.innerHTML = `<div class="forecast-item-server">No forecast data available</div>`;
    return;
  }

  // Step 4: Render
  futureForecasts.forEach(hourData => {
    const timeLabel = new Date(hourData.localTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC" // to ensure manual offset logic is not affected by device
    });

    const icon = hourData.weather[0]?.icon || "01d";
    const description = hourData.weather[0]?.description || "clear sky";
    const temp = Math.round(hourData.main.temp);
    const { tempClass, tempWarning } = getTemperatureWarning(temp);

    hourlyContainer.innerHTML += `
      <div class="forecast-item-server">
        <div class="server-time">${timeLabel}</div>
        <img class="server-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <div class="server-description">${description}</div>
        <div class="server-temp ${tempClass}">${temp}°C ${tempWarning}</div>
      </div>
    `;
  });
};




const renderUVandPrecipitation = (weatherDay, uvIndex) => {
  const displayUV = uvIndex !== null && uvIndex !== undefined ? uvIndex : "--";
  
  let description = "Unavailable";
  let colorClass = "uv-na";

  if (uvIndex !== null && uvIndex !== undefined) {
    if (uvIndex <= 2) {
      description = "Low";
   
    } else if (uvIndex <= 5) {
      description = "Moderate";
    
    } else if (uvIndex <= 7) {
      description = "High";
      
    } else if (uvIndex <= 10) {
      description = "Very High";
     
    } else {
      description = "Extreme";
    
    }
  }

  return `
    <div class="uv-container">
      <div class="uv-header">
        <i class="fas fa-sun"></i><span>UV Index</span>
      </div>
      <div class="uv-content">
        <p class="uv-value" id="uv-value">${displayUV}</p>
        <p class="uv-description ${colorClass}" id="uv-description">${description}</p>
        <div class="progress-container">
          <div class="uv-bar ${colorClass}" id="uv-progress"</div>
        </div>
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

function getTemperatureWarning(temp) {
  let tempClass = "";
  let tempWarning = "";
  if (temp > 31) {
    tempClass = "high-temp";
    tempWarning = `<span class="temp-warning" title="High temperature">⚠️</span>`;
  }
  return { tempClass, tempWarning };
}

export { weatherToday, renderAirConditions, renderUVandPrecipitation, renderHourlyForecast };