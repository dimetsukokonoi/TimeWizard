/**
 * Main Application Entry Point (Enhanced)
 * Initializes all modules including premium features
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core modules
    Background.init();
    Clock.init();
    Greeting.init();
    Focus.init();
    Quotes.init();
    Weather.init();
    Todo.init();
    Pomodoro.init();
    Links.init();

    // Initialize premium modules
    Sounds.init();
    Notes.init();
    WorldClocks.init();
    Metrics.init();
    Countdown.init();
    FocusMode.init();
    Mantras.init();
    Photos.init();

    // Initialize settings last (depends on other modules)
    Settings.init();

    console.log('🚀 Momentum Clone (Premium) initialized successfully!');

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Space to toggle Pomodoro
        if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
            e.preventDefault();
            Pomodoro.toggle();
        }

        // Ctrl/Cmd + Enter to start/pause timer
        if ((e.ctrlKey || e.metaKey) && e.code === 'Enter') {
            e.preventDefault();
            if (Pomodoro.isActive) {
                if (Pomodoro.isRunning) {
                    Pomodoro.pause();
                } else {
                    Pomodoro.start();
                }
            }
        }

        // F to toggle Focus Mode
        if (e.code === 'KeyF' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
            FocusMode.toggle();
        }
    });
});
