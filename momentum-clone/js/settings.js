/**
 * Settings Module (Enhanced)
 * Tabbed settings with all customization options
 */

const Settings = {
    panel: null,
    toggleBtn: null,
    tabs: null,
    contents: {},

    init() {
        this.panel = document.getElementById('settingsPanel');
        this.toggleBtn = document.getElementById('settingsBtn');
        this.tabs = document.querySelectorAll('.settings-tab');

        this.contents = {
            general: document.getElementById('settingsGeneral'),
            pomodoro: document.getElementById('settingsPomodoro'),
            blocker: document.getElementById('settingsBlocker'),
            appearance: document.getElementById('settingsAppearance')
        };

        this.load();
        this.bindEvents();
    },

    load() {
        // General settings
        document.getElementById('settingsName').value = Storage.get('userName', '');
        document.getElementById('settingsTimeFormat').value = Storage.get('timeFormat', '12');
        document.getElementById('settingsMantra').value = Storage.get('mantra', '');
        document.getElementById('settingsShowSeconds').checked = Storage.get('showSeconds', false);

        // Pomodoro settings
        document.getElementById('settingsFocusDuration').value = Storage.get('focusDuration', 25);
        document.getElementById('settingsBreakDuration').value = Storage.get('breakDuration', 5);
        document.getElementById('settingsLongBreak').value = Storage.get('longBreakDuration', 15);
        document.getElementById('settingsLongBreakInterval').value = Storage.get('longBreakInterval', 4);
        document.getElementById('settingsAutoBreak').checked = Storage.get('autoBreak', false);
        document.getElementById('settingsAutoFocus').checked = Storage.get('autoFocus', false);

        // Appearance settings
        document.getElementById('settingsFont').value = Storage.get('fontFamily', 'Inter');
        document.getElementById('settingsClockSize').value = Storage.get('clockSize', 'normal');
        document.getElementById('settingsDarkOverlay').checked = Storage.get('darkOverlay', true);

        // Apply saved appearance
        this.applyAppearance();
    },

    bindEvents() {
        // Toggle panel
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

        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // General settings
        document.getElementById('settingsName').addEventListener('change', (e) => {
            Greeting.setName(e.target.value);
        });

        document.getElementById('settingsTimeFormat').addEventListener('change', (e) => {
            Clock.setFormat(e.target.value);
        });

        document.getElementById('settingsMantra').addEventListener('change', (e) => {
            Mantras.setMantra(e.target.value);
        });

        document.getElementById('settingsShowSeconds').addEventListener('change', (e) => {
            Storage.set('showSeconds', e.target.checked);
            Clock.showSeconds = e.target.checked;
            Clock.update();
        });

        // Pomodoro settings
        ['settingsFocusDuration', 'settingsBreakDuration', 'settingsLongBreak', 'settingsLongBreakInterval'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updatePomodoroSettings());
        });

        document.getElementById('settingsAutoBreak').addEventListener('change', (e) => {
            const autoFocus = document.getElementById('settingsAutoFocus').checked;
            Pomodoro.setAutoSettings(e.target.checked, autoFocus);
        });

        document.getElementById('settingsAutoFocus').addEventListener('change', (e) => {
            const autoBreak = document.getElementById('settingsAutoBreak').checked;
            Pomodoro.setAutoSettings(autoBreak, e.target.checked);
        });

        // Appearance settings
        document.getElementById('settingsFont').addEventListener('change', (e) => {
            Storage.set('fontFamily', e.target.value);
            this.applyAppearance();
        });

        document.getElementById('settingsClockSize').addEventListener('change', (e) => {
            Storage.set('clockSize', e.target.value);
            this.applyAppearance();
        });

        document.getElementById('settingsDarkOverlay').addEventListener('change', (e) => {
            Storage.set('darkOverlay', e.target.checked);
            this.applyAppearance();
        });
    },

    switchTab(tabName) {
        this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));

        Object.entries(this.contents).forEach(([name, el]) => {
            if (el) el.classList.toggle('hidden', name !== tabName);
        });
    },

    updatePomodoroSettings() {
        const focus = parseInt(document.getElementById('settingsFocusDuration').value) || 25;
        const breakTime = parseInt(document.getElementById('settingsBreakDuration').value) || 5;
        const longBreak = parseInt(document.getElementById('settingsLongBreak').value) || 15;
        const longBreakInterval = parseInt(document.getElementById('settingsLongBreakInterval').value) || 4;

        Pomodoro.setDurations(focus, breakTime, longBreak, longBreakInterval);
    },

    applyAppearance() {
        const font = Storage.get('fontFamily', 'Inter');
        const clockSize = Storage.get('clockSize', 'normal');
        const darkOverlay = Storage.get('darkOverlay', true);

        // Apply font
        document.body.style.fontFamily = `'${font}', sans-serif`;

        // Apply clock size
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            clockEl.classList.remove('clock-small', 'clock-large');
            if (clockSize !== 'normal') {
                clockEl.classList.add(`clock-${clockSize}`);
            }
        }

        // Apply overlay
        const overlay = document.querySelector('.background-overlay');
        if (overlay) {
            overlay.style.opacity = darkOverlay ? '1' : '0.3';
        }
    },

    closeOtherPanels() {
        document.querySelectorAll('.panel.active').forEach(p => {
            if (p !== this.panel) p.classList.remove('active');
        });
    }
};
