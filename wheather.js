const API_KEY = "d7cff2af7b1db578468cddfa600a09e5"; // 🔹 OpenWeatherMap API Key

// 🌍 Get Weather & AQI Data
async function getWeather() {
    const city = document.getElementById("city-input").value.trim();
    if (city === "") {
        alert("Please enter a city name!");
        return;
    }

    try {
        console.log("Fetching weather for:", city);

        // 📍 Get City Latitude & Longitude
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            alert("City not found! Please try again.");
            return;
        }

        const { lat, lon, name, country } = geoData[0];
        document.getElementById("time-zone").textContent = name;
        document.getElementById("country").textContent = country;

        // 🌦 Get Weather Data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        document.getElementById("current-weather-items").innerHTML = `
            <p>Temperature: ${weatherData.main.temp}°C</p>
            <p>Feels Like: ${weatherData.main.feels_like}°C</p>
            <p>Humidity: ${weatherData.main.humidity}%</p>
            <p>Weather: ${weatherData.weather[0].description}</p>
        `;

        // 🌬 Fetch AQI Data
        const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const airResponse = await fetch(airQualityUrl);
        const airData = await airResponse.json();

        if (airData.list.length > 0) {
            const aqi = airData.list[0].main.aqi;
            document.getElementById("air-quality").innerHTML = `<div>Air Quality: ${aqi} - <b>${getAQIText(aqi)}</b></div>`;
        } else {
            document.getElementById("air-quality").innerHTML = "<div>AQI Data Not Available</div>";
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Something went wrong! Try again.");
    }
}

// 🎨 AQI Value to Text Category
function getAQIText(aqi) {
    if (aqi === 1) return "Good 🟢";
    if (aqi === 2) return "Fair 🟡";
    if (aqi === 3) return "Moderate 🟠";
    if (aqi === 4) return "Poor 🔴";
    if (aqi === 5) return "Very Poor 🟣";
    return "Unknown";
}

// 🚨 Earthquake Alert Function
async function getEarthquakeAlert() {
    try {
        const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson");
        const data = await response.json();

        if (data.features.length > 0) {
            let recentEarthquake = data.features[0];
            let magnitude = recentEarthquake.properties.mag;
            let place = recentEarthquake.properties.place;
            let time = new Date(recentEarthquake.properties.time).toLocaleString();

            document.getElementById("earthquake-alert").innerHTML = `
                <div class="alert">
                    🚨 <b>Earthquake Alert!</b> 🚨 <br>
                    <b>Magnitude:</b> ${magnitude} <br>
                    <b>Location:</b> ${place} <br>
                    <b>Time:</b> ${time} <br>
                </div>
            `;
        } else {
            document.getElementById("earthquake-alert").innerHTML = "<div>No recent earthquakes detected.</div>";
        }
    } catch (error) {
        console.error("Error fetching earthquake data:", error);
        document.getElementById("earthquake-alert").innerHTML = "<div>Could not fetch earthquake data.</div>";
    }
}

// 🌍 Auto-refresh earthquake data every 5 minutes
setInterval(getEarthquakeAlert, 5 * 60 * 1000);
getEarthquakeAlert();

// ⏰ Time Update Function
function updateTime() {
    let now = new Date();
    let options = { timeZone: "Asia/Kolkata", hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" };
    let localTime = now.toLocaleTimeString("en-US", options);
    let [mainTime, amPm] = localTime.split(" ");

    document.getElementById("time").innerHTML = `${mainTime} <span id="am-pm">${amPm}</span>`;
    document.getElementById("date").innerHTML = now.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" });
}
setInterval(updateTime, 1000);
updateTime();

// 🔍 City Suggestion Feature
async function getCitySuggestions() {
    const query = document.getElementById("city-input").value.trim();
    if (query.length < 2) {
        document.getElementById("suggestion-box").innerHTML = "";
        return;
    }
    try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById("suggestion-box").innerHTML = "<div>No matching cities found</div>";
            return;
        }
        let suggestions = data.map(city => `<div class="suggestion-item" onclick="selectCity('${city.name}, ${city.country}')">${city.name}, ${city.country}</div>`).join("");
        document.getElementById("suggestion-box").innerHTML = suggestions;
    } catch (error) {
        console.error("Error fetching city suggestions:", error);
    }
}

// 🏙️ Select City from Suggestions
function selectCity(city) {
    document.getElementById("city-input").value = city;
    document.getElementById("suggestion-box").innerHTML = "";
    getWeather();
}

// 🌍 Search for Villages & Districts (OpenStreetMap API)
async function searchOSM(query) {
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${query}, India`;
    const response = await fetch(apiUrl);
    const locations = await response.json();
    console.log(locations); // ✅ Yeh multiple villages aur districts dikhayega
}
