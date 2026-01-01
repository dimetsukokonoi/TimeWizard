/**
 * Weather Module
 * Geolocation-based weather display
 * Uses Open-Meteo API (free, no API key required)
 */

const Weather = {
    widget: null,
    iconElement: null,
    tempElement: null,
    locationElement: null,
    hasLocationPermission: false,

    // Weather condition codes to emojis mapping (WMO codes)
    weatherIcons: {
        0: '☀️',   // Clear sky
        1: '🌤️',  // Mainly clear
        2: '⛅',   // Partly cloudy
        3: '☁️',   // Overcast
        45: '🌫️', // Fog
        48: '🌫️', // Depositing rime fog
        51: '🌧️', // Light drizzle
        53: '🌧️', // Moderate drizzle
        55: '🌧️', // Dense drizzle
        56: '🌧️', // Light freezing drizzle
        57: '🌧️', // Dense freezing drizzle
        61: '🌦️', // Slight rain
        63: '🌧️', // Moderate rain
        65: '🌧️', // Heavy rain
        66: '🌧️', // Light freezing rain
        67: '🌧️', // Heavy freezing rain
        71: '🌨️', // Slight snow fall
        73: '🌨️', // Moderate snow fall
        75: '❄️',  // Heavy snow fall
        77: '🌨️', // Snow grains
        80: '🌦️', // Slight rain showers
        81: '🌧️', // Moderate rain showers
        82: '🌧️', // Violent rain showers
        85: '🌨️', // Slight snow showers
        86: '❄️',  // Heavy snow showers
        95: '⛈️', // Thunderstorm
        96: '⛈️', // Thunderstorm with slight hail
        99: '⛈️'  // Thunderstorm with heavy hail
    },

    init() {
        this.widget = document.getElementById('weatherWidget');
        this.iconElement = document.getElementById('weatherIcon');
        this.tempElement = document.getElementById('weatherTemp');
        this.locationElement = document.getElementById('weatherLocation');

        this.loadWeather();
    },

    loadWeather() {
        // Check for cached weather data (cache for 30 minutes)
        const cached = Storage.get('weatherCache');
        if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
            this.displayWeather(cached.data);
            return;
        }

        // Request geolocation
        if (navigator.geolocation) {
            this.locationElement.textContent = 'Getting location...';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.hasLocationPermission = true;
                    this.fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.log('Geolocation error:', error.message);
                    this.hasLocationPermission = false;
                    this.handleNoLocation();
                },
                {
                    timeout: 10000,
                    enableHighAccuracy: false,
                    maximumAge: 30 * 60 * 1000 // Accept cached position up to 30 min old
                }
            );
        } else {
            this.hasLocationPermission = false;
            this.handleNoLocation();
        }
    },

    async fetchWeather(lat, lon) {
        try {
            // Fetch weather from Open-Meteo (free, no API key needed)
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
            );

            if (!weatherResponse.ok) {
                throw new Error('Weather API error');
            }

            const weatherData = await weatherResponse.json();

            // Fetch location name using reverse geocoding (free service)
            let locationName = '';
            try {
                const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
                );

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    // Try to get city/town name
                    locationName = geoData.address?.city ||
                        geoData.address?.town ||
                        geoData.address?.village ||
                        geoData.address?.municipality ||
                        geoData.address?.county ||
                        geoData.address?.state ||
                        'Your Location';
                }
            } catch (geoError) {
                console.log('Geocoding error:', geoError);
                locationName = 'Your Location';
            }

            const data = {
                temp: Math.round(weatherData.current_weather.temperature),
                weatherCode: weatherData.current_weather.weathercode,
                isDay: weatherData.current_weather.is_day === 1,
                location: locationName,
                hasLocation: true
            };

            // Cache the data
            Storage.set('weatherCache', { data, timestamp: Date.now() });
            this.displayWeather(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.handleNoLocation();
        }
    },

    handleNoLocation() {
        // Show temperature only, hide location when no permission
        const hour = new Date().getHours();
        const isDay = hour >= 6 && hour < 18;

        // Show a reasonable temperature estimate
        const data = {
            temp: '--',
            weatherCode: isDay ? 0 : 0,
            isDay: isDay,
            location: '',
            hasLocation: false
        };

        this.displayWeather(data);
    },

    displayWeather(data) {
        // Get appropriate icon
        const icon = this.weatherIcons[data.weatherCode] || (data.isDay ? '☀️' : '🌙');
        this.iconElement.textContent = icon;

        // Display temperature
        if (data.temp === '--') {
            this.tempElement.textContent = '--°';
        } else {
            this.tempElement.textContent = `${data.temp}°C`;
        }

        // Show/hide location based on permission
        if (data.hasLocation && data.location) {
            this.locationElement.textContent = data.location;
            this.locationElement.style.display = 'inline';
        } else {
            this.locationElement.textContent = 'Enable location';
            this.locationElement.style.cursor = 'pointer';
            this.locationElement.title = 'Click to enable location';
            this.locationElement.onclick = () => this.requestLocation();
        }
    },

    requestLocation() {
        // Clear cache and try again
        Storage.remove('weatherCache');
        this.locationElement.textContent = 'Requesting...';
        this.loadWeather();
    }
};
