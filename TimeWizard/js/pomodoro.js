/**
 * Pomodoro Timer Module (Enhanced)
 * Focus/Break timer with sessions, long breaks, and metrics integration
 */

const Pomodoro = {
    container: null,
    clockContainer: null,
    timeDisplay: null,
    labelDisplay: null,
    progress: null,
    controls: null,
    toggleBtn: null,
    startBtn: null,
    pauseBtn: null,
    resetBtn: null,
    breakBtn: null,
    skipBtn: null,
    sessionDots: null,
    timerSound: null,

    // Timer state
    isActive: false,
    isRunning: false,
    isBreak: false,
    timeRemaining: 25 * 60,
    totalTime: 25 * 60,
    interval: null,
    currentSession: 0,

    // Settings (in minutes)
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoBreak: false,
    autoFocus: false,

    // Circle properties
    circumference: 2 * Math.PI * 90,

    init() {
        this.container = document.getElementById('pomodoroContainer');
        this.clockContainer = document.getElementById('clockContainer');
        this.timeDisplay = document.getElementById('pomodoroTime');
        this.labelDisplay = document.getElementById('pomodoroLabel');
        this.progress = document.getElementById('pomodoroProgress');
        this.controls = document.getElementById('pomodoroControls');
        this.toggleBtn = document.getElementById('pomodoroToggle');
        this.startBtn = document.getElementById('pomodoroStart');
        this.pauseBtn = document.getElementById('pomodoroPause');
        this.resetBtn = document.getElementById('pomodoroReset');
        this.breakBtn = document.getElementById('pomodoroBreak');
        this.skipBtn = document.getElementById('pomodoroSkip');
        this.sessionDots = document.getElementById('pomodoroSessions');
        this.timerSound = document.getElementById('timerSound');

        // Load settings
        this.focusDuration = Storage.get('focusDuration', 25);
        this.breakDuration = Storage.get('breakDuration', 5);
        this.longBreakDuration = Storage.get('longBreakDuration', 15);
        this.longBreakInterval = Storage.get('longBreakInterval', 4);
        this.autoBreak = Storage.get('autoBreak', false);
        this.autoFocus = Storage.get('autoFocus', false);

        this.timeRemaining = this.focusDuration * 60;
        this.totalTime = this.focusDuration * 60;

        // Set up circle
        this.progress.style.strokeDasharray = this.circumference;
        this.progress.style.strokeDashoffset = 0;

        this.bindEvents();
        this.updateDisplay();
        this.updateSessionDots();
    },

    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggle());
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.breakBtn.addEventListener('click', () => this.toggleBreakMode());
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => this.skip());
        }
    },

    toggle() {
        this.isActive = !this.isActive;

        if (this.isActive) {
            this.container.classList.add('active');
            this.clockContainer.style.display = 'none';
            this.controls.classList.add('active');
            this.toggleBtn.classList.add('active');
        } else {
            this.container.classList.remove('active');
            this.clockContainer.style.display = 'block';
            this.controls.classList.remove('active');
            this.toggleBtn.classList.remove('active');
            this.pause();
        }
    },

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';

        this.interval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            this.updateProgress();

            if (this.timeRemaining <= 0) {
                this.complete();
            }
        }, 1000);
    },

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    reset() {
        this.pause();

        if (this.isBreak) {
            const isLongBreak = this.currentSession >= this.longBreakInterval;
            this.timeRemaining = (isLongBreak ? this.longBreakDuration : this.breakDuration) * 60;
            this.totalTime = this.timeRemaining;
        } else {
            this.timeRemaining = this.focusDuration * 60;
            this.totalTime = this.focusDuration * 60;
        }

        this.updateDisplay();
        this.updateProgress();
    },

    skip() {
        this.complete();
    },

    toggleBreakMode() {
        this.pause();
        this.isBreak = !this.isBreak;

        if (this.isBreak) {
            const isLongBreak = this.currentSession >= this.longBreakInterval;
            this.totalTime = (isLongBreak ? this.longBreakDuration : this.breakDuration) * 60;
            this.timeRemaining = this.totalTime;
            this.labelDisplay.textContent = isLongBreak ? 'Long Break' : 'Short Break';
            this.progress.classList.add('break');
            this.breakBtn.textContent = 'Focus';
        } else {
            this.totalTime = this.focusDuration * 60;
            this.timeRemaining = this.totalTime;
            this.labelDisplay.textContent = 'Focus Time';
            this.progress.classList.remove('break');
            this.breakBtn.textContent = 'Break';
        }

        this.updateDisplay();
        this.updateProgress();
    },

    // Motivational messages for session completion
    motivationalMessages: [
        "🎉 Amazing work! You crushed it!",
        "🔥 You're on fire! Keep going!",
        "⭐ Fantastic focus session!",
        "💪 Great job! You're unstoppable!",
        "🚀 Session complete! You're a star!",
        "🏆 Champion focus! Well done!",
        "✨ Brilliant work! Take a breather!",
        "🎯 Nailed it! Time for a break!",
        "💫 Incredible discipline! Rest up!",
        "🌟 You're making amazing progress!"
    ],

    breakMessages: [
        "☕ Break's over! Ready to focus?",
        "🌱 Refreshed? Let's get back to it!",
        "💪 Recharged! Time to shine!",
        "🎯 Break complete! Focus mode ON!",
        "⚡ Energized! Let's do this!"
    ],

    complete() {
        this.pause();

        // Play sound
        if (this.timerSound) {
            this.timerSound.currentTime = 0;
            this.timerSound.play().catch(() => { });
        }

        // Select random motivational message
        const isCompletingFocus = !this.isBreak;
        const messages = isCompletingFocus ? this.motivationalMessages : this.breakMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Show motivational message temporarily
        this.showCongratulation(randomMessage, isCompletingFocus);

        // Record metrics if focus session completed
        if (!this.isBreak) {
            this.currentSession++;
            this.updateSessionDots();

            // Record to metrics
            if (typeof Metrics !== 'undefined') {
                Metrics.recordSession(this.focusDuration);
            }
        }

        // Show notification
        if (Notification.permission === 'granted') {
            new Notification(this.isBreak ? 'Break Complete!' : 'Focus Session Complete!', {
                body: randomMessage,
                icon: 'assets/icons/icon128.png'
            });
        }

        // Auto-switch mode
        this.isBreak = !this.isBreak;

        if (this.isBreak) {
            // Check if long break
            const isLongBreak = this.currentSession >= this.longBreakInterval;
            if (isLongBreak) {
                this.currentSession = 0;
                this.updateSessionDots();
            }

            this.totalTime = (isLongBreak ? this.longBreakDuration : this.breakDuration) * 60;
            this.timeRemaining = this.totalTime;
            this.labelDisplay.textContent = isLongBreak ? 'Long Break' : 'Short Break';
            this.progress.classList.add('break');
            this.breakBtn.textContent = 'Focus';

            if (this.autoBreak) {
                setTimeout(() => this.start(), 3000); // Delay to show message
            }
        } else {
            this.totalTime = this.focusDuration * 60;
            this.timeRemaining = this.totalTime;
            this.labelDisplay.textContent = 'Focus Time';
            this.progress.classList.remove('break');
            this.breakBtn.textContent = 'Break';

            if (this.autoFocus) {
                setTimeout(() => this.start(), 3000); // Delay to show message
            }
        }

        this.updateDisplay();
        this.updateProgress();
    },

    showCongratulation(message, isFocusComplete) {
        // Temporarily show congratulation message in the timer display
        const originalTime = this.timeDisplay.textContent;

        // Show message in label
        this.labelDisplay.textContent = message;
        this.labelDisplay.style.fontSize = '1rem';
        this.labelDisplay.style.color = isFocusComplete ? 'var(--accent)' : 'var(--success)';

        // Show celebratory time display
        this.timeDisplay.textContent = isFocusComplete ? '🎉' : '☕';
        this.timeDisplay.style.fontSize = '4rem';

        // Restore after 2.5 seconds
        setTimeout(() => {
            this.labelDisplay.style.fontSize = '';
            this.labelDisplay.style.color = '';
            this.timeDisplay.style.fontSize = '';
            this.updateDisplay();
        }, 2500);
    },

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update page title
        if (this.isRunning) {
            document.title = `${this.timeDisplay.textContent} - ${this.isBreak ? 'Break' : 'Focus'}`;
        } else {
            document.title = 'New Tab';
        }
    },

    updateProgress() {
        const progress = (this.totalTime - this.timeRemaining) / this.totalTime;
        const offset = this.circumference * (1 - progress);
        this.progress.style.strokeDashoffset = offset;
    },

    updateSessionDots() {
        if (!this.sessionDots) return;

        // Dynamically create the correct number of dots based on longBreakInterval
        let dotsHtml = '';
        for (let i = 0; i < this.longBreakInterval; i++) {
            const isCompleted = i < this.currentSession;
            dotsHtml += `<span class="session-dot${isCompleted ? ' completed' : ''}"></span>`;
        }
        this.sessionDots.innerHTML = dotsHtml;
    },

    setDurations(focus, breakTime, longBreak, longBreakInterval) {
        this.focusDuration = focus;
        this.breakDuration = breakTime;
        if (longBreak) this.longBreakDuration = longBreak;
        // Clamp longBreakInterval to max 5 to keep dots in a single line
        if (longBreakInterval) this.longBreakInterval = Math.min(longBreakInterval, 5);

        Storage.set('focusDuration', focus);
        Storage.set('breakDuration', breakTime);
        Storage.set('longBreakDuration', this.longBreakDuration);
        Storage.set('longBreakInterval', this.longBreakInterval);

        // Update session dots to reflect new longBreakInterval
        this.updateSessionDots();

        if (!this.isRunning) {
            this.reset();
        }
    },

    setAutoSettings(autoBreak, autoFocus) {
        this.autoBreak = autoBreak;
        this.autoFocus = autoFocus;
        Storage.set('autoBreak', autoBreak);
        Storage.set('autoFocus', autoFocus);
    }
};

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
