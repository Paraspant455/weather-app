const apiKey = "2755418cd9fb476994d72936250309"; // ✅ Your WeatherAPI key

// 📍 Get weather from input
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (city) {
    fetchWeather(`q=${city}`, city);
  } else {
    document.getElementById("weatherResult").innerHTML = "⚠️ Please enter a city name";
  }
}

// 📍 Get weather by coordinates
function getWeatherByLocation(lat, lon) {
  fetchWeather(`q=${lat},${lon}`, "My Location");
}

// 🌍 Fetch current + forecast
async function fetchWeather(query, cityName = "") {
  const resultDiv = document.getElementById("weatherResult");

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&${query}&days=5&aqi=no&alerts=no`
    );

    if (!response.ok) {
      resultDiv.innerHTML = "❌ City not found or API issue";
      return;
    }

    const data = await response.json();

    // 🌞 Switch theme (day/night)
    document.body.className = data.current.is_day === 1 ? "day" : "night";

    renderWeather(data, resultDiv);

    // 🗂 Save to history
    if (cityName && cityName !== "My Location") {
      saveToHistory(data.location.name);
    }

  } catch (error) {
    resultDiv.innerHTML = "⚠️ Error fetching data";
    console.error(error);
  }
}

// 🎨 Render weather into DOM
function renderWeather(data, container) {
  let output = `
    <h3>${data.location.name}, ${data.location.country}</h3>
    <p>🌡 Temperature: ${data.current.temp_c} °C</p>
    <p>☁️ Condition: ${data.current.condition.text}</p>
    <p>💨 Wind: ${data.current.wind_kph} kph</p>
    <img src="https:${data.current.condition.icon}" alt="weather icon">
    <h4>📅 5-Day Forecast</h4>
    <div class="forecast">
  `;

  // Forecast days
  data.forecast.forecastday.forEach((day) => {
    output += `
      <div class="forecast-day">
        <p><b>${day.date}</b></p>
        <img src="https:${day.day.condition.icon}" alt="icon">
        <p>${day.day.avgtemp_c} °C</p>
        <p>${day.day.condition.text}</p>
      </div>
    `;
  });

  output += `</div>`;
  container.innerHTML = output;
}

// 🗂 Save to search history (keep 5 max, latest first)
function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

  history = history.filter(c => c !== city); // remove if exists
  history.unshift(city);                     // add new at start
  history = history.slice(0, 5);             // keep max 5

  localStorage.setItem("weatherHistory", JSON.stringify(history));
  displayHistory();
}

// 📜 Display search history
function displayHistory() {
  const historyDiv = document.getElementById("history");
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

  historyDiv.innerHTML = "";
  history.forEach((city) => {
    const btn = document.createElement("div");
    btn.className = "history-item";
    btn.innerText = city;
    btn.addEventListener("click", () => fetchWeather(`q=${city}`, city));
    historyDiv.appendChild(btn);
  });
}

// 🚀 On page load
window.onload = () => {
  displayHistory();

  // 🌍 Try geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeatherByLocation(pos.coords.latitude, pos.coords.longitude),
      () => {
        document.getElementById("weatherResult").innerHTML =
          "⚠️ Location access denied. Please search manually.";
      }
    );
  } else {
    document.getElementById("weatherResult").innerHTML =
      "⚠️ Geolocation not supported by your browser.";
  }
};

// 🗑 Clear history
document.getElementById("clearHistory").addEventListener("click", () => {
  localStorage.removeItem("weatherHistory");
  displayHistory();
});

// 🔍 Attach search button event (instead of inline onclick)
document.getElementById("searchBtn").addEventListener("click", getWeather);
