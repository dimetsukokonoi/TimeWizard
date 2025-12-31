/**
 * Metrics Module
 * Productivity tracking and statistics
 */

const Metrics = {
    panel: null,
    toggleBtn: null,
    data: null,

    init() {
        this.panel = document.getElementById('metricsPanel');
        this.toggleBtn = document.getElementById('metricsBtn');

        this.loadData();
        this.render();
        this.bindEvents();
    },

    loadData() {
        this.data = Storage.get('metrics', {
            focusSessions: 0,
            totalFocusMinutes: 0,
            tasksCompleted: 0,
            streak: 0,
            lastActiveDate: null,
            weeklyData: [0, 0, 0, 0, 0, 0, 0] // Mon-Sun focus minutes
        });

        // Check streak
        this.updateStreak();
    },

    updateStreak() {
        const today = new Date().toDateString();
        const lastActive = this.data.lastActiveDate;

        if (!lastActive) {
            // First time
            this.data.streak = 0;
        } else if (lastActive === today) {
            // Same day, no change
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastActive === yesterday.toDateString()) {
                // Consecutive day - streak maintained
            } else {
                // Streak broken
                this.data.streak = 0;
            }
        }

        this.save();
    },

    recordSession(minutes) {
        const today = new Date().toDateString();
        const dayOfWeek = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6

        this.data.focusSessions++;
        this.data.totalFocusMinutes += minutes;
        this.data.weeklyData[dayOfWeek] += minutes;

        // Update streak if first session today
        if (this.data.lastActiveDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (this.data.lastActiveDate === yesterday.toDateString() || !this.data.lastActiveDate) {
                this.data.streak++;
            } else {
                this.data.streak = 1;
            }
            this.data.lastActiveDate = today;
        }

        this.save();
        this.render();
    },

    recordTaskComplete() {
        this.data.tasksCompleted++;
        this.save();
        this.render();
    },

    save() {
        Storage.set('metrics', this.data);
    },

    render() {
        // Update stats
        document.getElementById('metricFocusSessions').textContent = this.data.focusSessions;
        document.getElementById('metricTotalTime').textContent = this.formatTime(this.data.totalFocusMinutes);
        document.getElementById('metricTasksCompleted').textContent = this.data.tasksCompleted;
        document.getElementById('metricStreak').textContent = this.data.streak;

        // Render chart
        this.renderChart();
    },

    renderChart() {
        const chartBars = document.getElementById('chartBars');
        const max = Math.max(...this.data.weeklyData, 60); // Min 60 for scale

        chartBars.innerHTML = this.data.weeklyData.map((minutes, i) => {
            const height = (minutes / max) * 100;
            const isToday = i === (new Date().getDay() + 6) % 7;
            return `
        <div class="chart-bar ${isToday ? 'today' : ''}" 
             style="height: ${Math.max(height, 5)}%"
             title="${minutes} min">
        </div>
      `;
        }).join('');
    },

    formatTime(minutes) {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
    },

    closeOtherPanels() {
        document.querySelectorAll('.panel.active').forEach(p => {
            if (p !== this.panel) p.classList.remove('active');
        });
    }
};
