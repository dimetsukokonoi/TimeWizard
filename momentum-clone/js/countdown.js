/**
 * Countdown Module
 * Event countdown timers
 */

const Countdown = {
    panel: null,
    toggleBtn: null,
    list: null,
    nameInput: null,
    dateInput: null,
    addBtn: null,
    countdowns: [],
    updateInterval: null,

    init() {
        this.panel = document.getElementById('countdownPanel');
        this.toggleBtn = document.getElementById('countdownBtn');
        this.list = document.getElementById('countdownList');
        this.nameInput = document.getElementById('countdownName');
        this.dateInput = document.getElementById('countdownDate');
        this.addBtn = document.getElementById('addCountdownBtn');

        // Set min date to today
        this.dateInput.min = new Date().toISOString().split('T')[0];

        this.countdowns = Storage.get('countdowns', []);
        this.render();
        this.bindEvents();

        // Update every minute
        this.updateInterval = setInterval(() => this.render(), 60000);
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

        this.addBtn.addEventListener('click', () => this.addCountdown());

        this.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCountdown();
        });
    },

    addCountdown() {
        const name = this.nameInput.value.trim();
        const date = this.dateInput.value;

        if (!name || !date) return;

        this.countdowns.push({
            id: Date.now(),
            name: name,
            date: date
        });

        this.nameInput.value = '';
        this.dateInput.value = '';
        this.save();
        this.render();
    },

    removeCountdown(id) {
        this.countdowns = this.countdowns.filter(c => c.id !== id);
        this.save();
        this.render();
    },

    save() {
        Storage.set('countdowns', this.countdowns);
    },

    render() {
        if (this.countdowns.length === 0) {
            this.list.innerHTML = '<div class="no-countdowns">No countdowns set</div>';
            return;
        }

        // Sort by date
        const sorted = [...this.countdowns].sort((a, b) => new Date(a.date) - new Date(b.date));

        this.list.innerHTML = sorted.map(countdown => {
            const remaining = this.getRemaining(countdown.date);
            return `
        <div class="countdown-item ${remaining.passed ? 'passed' : ''}">
          <div class="countdown-info">
            <span class="countdown-name">${this.escapeHtml(countdown.name)}</span>
            <span class="countdown-remaining">${remaining.text}</span>
          </div>
          <button class="countdown-remove" data-id="${countdown.id}">✕</button>
        </div>
      `;
        }).join('');

        // Bind remove buttons
        this.list.querySelectorAll('.countdown-remove').forEach(btn => {
            btn.addEventListener('click', () => this.removeCountdown(parseInt(btn.dataset.id)));
        });
    },

    getRemaining(dateStr) {
        const target = new Date(dateStr + 'T23:59:59');
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
            return { passed: true, text: 'Event passed' };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days === 0) {
            return { passed: false, text: `${hours} hours` };
        } else if (days === 1) {
            return { passed: false, text: 'Tomorrow' };
        } else {
            return { passed: false, text: `${days} days` };
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    closeOtherPanels() {
        document.querySelectorAll('.panel.active').forEach(p => {
            if (p !== this.panel) p.classList.remove('active');
        });
    }
};
