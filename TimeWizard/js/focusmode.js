/**
 * Focus Mode Module
 * Hides distractions, shows only timer
 */

const FocusMode = {
    overlay: null,
    toggleBtn: null,
    isActive: false,

    init() {
        this.overlay = document.getElementById('focusModeOverlay');
        this.toggleBtn = document.getElementById('focusModeBtn');

        this.bindEvents();
    },

    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggle());

        // Exit focus mode on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.deactivate();
            }
        });

        // Click overlay to exit
        this.overlay.addEventListener('click', () => this.deactivate());
    },

    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    },

    activate() {
        this.isActive = true;
        this.overlay.classList.add('active');
        this.toggleBtn.classList.add('active');
        document.body.classList.add('focus-mode-active');

        // Activate Pomodoro if not already active
        if (!Pomodoro.isActive) {
            Pomodoro.toggle();
        }
    },

    deactivate() {
        this.isActive = false;
        this.overlay.classList.remove('active');
        this.toggleBtn.classList.remove('active');
        document.body.classList.remove('focus-mode-active');
    }
};
