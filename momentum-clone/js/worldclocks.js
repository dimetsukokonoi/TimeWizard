/**
 * World Clocks Module
 * Multiple timezone display
 */

const WorldClocks = {
    panel: null,
    toggleBtn: null,
    list: null,
    select: null,
    addBtn: null,
    clocks: [],
    updateInterval: null,

    timezoneNames: {
        'America/New_York': 'New York',
        'America/Los_Angeles': 'Los Angeles',
        'America/Chicago': 'Chicago',
        'Europe/London': 'London',
        'Europe/Paris': 'Paris',
        'Europe/Berlin': 'Berlin',
        'Asia/Tokyo': 'Tokyo',
        'Asia/Shanghai': 'Shanghai',
        'Asia/Dubai': 'Dubai',
        'Asia/Singapore': 'Singapore',
        'Asia/Kolkata': 'Mumbai',
        'Asia/Dhaka': 'Dhaka',
        'Australia/Sydney': 'Sydney',
        'Pacific/Auckland': 'Auckland'
    },

    init() {
        this.panel = document.getElementById('worldClocksPanel');
        this.toggleBtn = document.getElementById('worldClocksBtn');
        this.list = document.getElementById('worldClocksList');
        this.select = document.getElementById('timezoneSelect');
        this.addBtn = document.getElementById('addWorldClockBtn');

        this.clocks = Storage.get('worldClocks', []);
        this.render();
        this.bindEvents();

        // Update clocks every second
        this.updateInterval = setInterval(() => this.updateTimes(), 1000);
    },

    bindEvents() {
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeOtherPanels();
            this.panel.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });

        this.addBtn.addEventListener('click', () => this.addClock());
    },

    addClock() {
        const timezone = this.select.value;
        if (!timezone || this.clocks.includes(timezone)) return;

        this.clocks.push(timezone);
        Storage.set('worldClocks', this.clocks);
        this.select.value = '';
        this.render();
    },

    removeClock(timezone) {
        this.clocks = this.clocks.filter(tz => tz !== timezone);
        Storage.set('worldClocks', this.clocks);
        this.render();
    },

    render() {
        if (this.clocks.length === 0) {
            this.list.innerHTML = '<div class="no-clocks">No world clocks added</div>';
            return;
        }

        this.list.innerHTML = this.clocks.map(tz => `
      <div class="world-clock-item" data-timezone="${tz}">
        <div class="world-clock-info">
          <span class="world-clock-city">${this.timezoneNames[tz] || tz}</span>
          <span class="world-clock-time">--:--</span>
        </div>
        <button class="world-clock-remove" data-tz="${tz}">✕</button>
      </div>
    `).join('');

        // Bind remove buttons
        this.list.querySelectorAll('.world-clock-remove').forEach(btn => {
            btn.addEventListener('click', () => this.removeClock(btn.dataset.tz));
        });

        this.updateTimes();
    },

    updateTimes() {
        this.list.querySelectorAll('.world-clock-item').forEach(item => {
            const tz = item.dataset.timezone;
            const timeEl = item.querySelector('.world-clock-time');

            try {
                const time = new Date().toLocaleTimeString('en-US', {
                    timeZone: tz,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: Storage.get('timeFormat', '12') === '12'
                });
                timeEl.textContent = time;
            } catch (e) {
                timeEl.textContent = 'Error';
            }
        });
    },

    closeOtherPanels() {
        document.querySelectorAll('.panel.active').forEach(p => {
            if (p !== this.panel) p.classList.remove('active');
        });
    }
};
