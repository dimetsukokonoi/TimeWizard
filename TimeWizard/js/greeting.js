/**
 * Greeting Module
 * Time-based personalized greeting
 */

const Greeting = {
    element: null,
    name: 'friend',

    init() {
        this.element = document.getElementById('greeting');
        this.name = Storage.get('userName', 'friend');
        this.update();

        // Update greeting every minute
        setInterval(() => this.update(), 60000);
    },

    update() {
        const hour = new Date().getHours();
        let timeOfDay;

        if (hour >= 5 && hour < 12) {
            timeOfDay = 'morning';
        } else if (hour >= 12 && hour < 17) {
            timeOfDay = 'afternoon';
        } else if (hour >= 17 && hour < 21) {
            timeOfDay = 'evening';
        } else {
            timeOfDay = 'night';
        }

        this.element.textContent = `Good ${timeOfDay}, ${this.name}`;
    },

    setName(name) {
        this.name = name || 'friend';
        Storage.set('userName', this.name);
        this.update();
    }
};
