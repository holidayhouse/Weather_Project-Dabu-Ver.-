// uv-index.js - Handles UV index calculation and display

function calculateUVIndex({ latitude, longitude }) {
  const now = new Date();

  const month = now.getMonth(); // 0 = Jan, ..., 11 = Dec
  const utcHour = now.getUTCHours(); // Get UTC time
  const timezoneOffsetFromLon = Math.round(longitude / 15); // 15° per hour
  const localSolarHour = (utcHour + timezoneOffsetFromLon + 24) % 24;

  const absLat = Math.abs(latitude);
  const isNorthern = latitude >= 0;

  // Adjust month if in Southern Hemisphere (shift by 6 months)
  const adjustedMonth = isNorthern ? month : (month + 6) % 12;

  // Estimate base UV based on latitude + month (approximation)
  function estimateBaseUV(lat, month) {
    if (lat < 25) return 11; // tropical
    if (lat < 45) return [3, 4, 5, 7, 8, 9, 10, 9, 7, 5, 3, 2][month];
    if (lat < 60) return [2, 3, 4, 6, 7, 8, 8, 7, 5, 3, 2, 1][month];
    return [1, 2, 2, 3, 4, 5, 5, 4, 3, 2, 1, 1][month]; // high lat
  }

  const baseUV = estimateBaseUV(absLat, adjustedMonth);

  // Check if it's nighttime (assume UV ~ 0 from 6PM to 6AM)
  if (localSolarHour < 6 || localSolarHour > 18) {
    console.log("Night time detected, setting UV to 0.");
    return 0;
  }

  // Gaussian curve centered at noon
  const peakHour = 12;
  const sigma = 3.5;
  const timeFactor = Math.exp(-Math.pow(localSolarHour - peakHour, 2) / (2 * Math.pow(sigma, 2)));

  // Latitude factor using cosine
  const latitudeFactor = Math.cos((Math.PI / 180) * absLat);

  const rawUV = baseUV * timeFactor * latitudeFactor;

  // Debug output
  console.log("UTC Hour:", utcHour);
  console.log("Longitude Offset:", timezoneOffsetFromLon);
  console.log("Local Solar Hour:", localSolarHour);
  console.log("Base UV:", baseUV);
  console.log("Time Factor:", timeFactor.toFixed(2));
  console.log("Latitude Factor:", latitudeFactor.toFixed(2));
  console.log("Raw UV:", rawUV.toFixed(2));

  return Math.min(11, Math.max(0, Math.round(rawUV)));
}




export function updateUVDisplay(uvIndex) {
  const uvValue = document.getElementById('uv-value');
  const uvDescription = document.getElementById('uv-description');
  const uvProgress = document.getElementById('uv-progress');

  if (!uvValue || !uvDescription || !uvProgress) {
    console.error("UV display elements not found in the DOM");
    return;
  }

  // Update numeric UV display
  uvValue.textContent = uvIndex;

  // Determine category and styling
  let description = "";
  let progressClass = "";

  if (uvIndex <= 2) {
    description = "Low";
    progressClass = "uv-low";
  } else if (uvIndex <= 5) {
    description = "Moderate";
    progressClass = "uv-moderate";
  } else if (uvIndex <= 7) {
    description = "High";
    progressClass = "uv-high";
  } else if (uvIndex <= 10) {
    description = "Very High";
    progressClass = "uv-very-high";
  } else {
    description = "Extreme";
    progressClass = "uv-extreme";
  }

  // Update description text
  uvDescription.textContent = description;

  // Reset classes and apply new one
  uvProgress.className = "uv-bar"; // base class
  uvProgress.classList.add(progressClass); // add color class

  // Adjust the progress bar width (UV Index is from 0 to 11+)
  const progressWidth = `${Math.min((uvIndex / 11) * 100, 100)}%`;
  uvProgress.style.width = progressWidth;

  // Debug logs
  console.log("UV Index:", uvIndex);
  console.log("Setting width:", progressWidth);
  console.log("Applied class:", progressClass);
}


export function updateUVIndexForCity(lat, lon) {
  if (!lat || !lon) return 0;

  const coords = {
    latitude: parseFloat(lat),
    longitude: parseFloat(lon)
  };

  const uvIndex = calculateUVIndex(coords);
  return uvIndex;
}

