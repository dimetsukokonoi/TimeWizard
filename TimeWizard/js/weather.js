/**
 * Weather Module
 * Geolocation-based weather display
 * Uses OpenWeatherMap API (demo mode fallback)
 */

const Weather = {
    widget: null,
    iconElement: null,
    tempElement: null,
    locationElement: null,
    // Demo API key for OpenWeatherMap (replace with your own for production)
    apiKey: '', // Leave empty for demo mode

    weatherIcons: {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '🌨️', '13n': '🌨️',
        '50d': '🌫️', '50n': '🌫️'
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

        // Try to get location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => this.fetchWeather(position.coords.latitude, position.coords.longitude),
                () => this.useDemoWeather(),
                { timeout: 5000 }
            );
        } else {
            this.useDemoWeather();
        }
    },

    async fetchWeather(lat, lon) {
        if (!this.apiKey) {
            this.useDemoWeather();
            return;
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
            );
            const data = await response.json();

            const weatherData = {
                temp: Math.round(data.main.temp),
                icon: data.weather[0].icon,
                location: data.name
            };

            // Cache the data
            Storage.set('weatherCache', { data: weatherData, timestamp: Date.now() });
            this.displayWeather(weatherData);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.useDemoWeather();
        }
    },

    useDemoWeather() {
        // Demo weather based on time of day
        const hour = new Date().getHours();
        const isDay = hour >= 6 && hour < 18;

        const demoData = {
            temp: Math.round(15 + Math.random() * 10),
            icon: isDay ? '01d' : '01n',
            location: 'Your Location'
        };

        this.displayWeather(demoData);
    },

    displayWeather(data) {
        this.iconElement.textContent = this.weatherIcons[data.icon] || '🌤️';
        this.tempElement.textContent = `${data.temp}°`;
        this.locationElement.textContent = data.location;
    }
};
