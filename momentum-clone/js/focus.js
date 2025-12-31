/**
 * Focus Module
 * Daily focus input with persistence and daily reset
 */

const Focus = {
    question: null,
    input: null,
    display: null,
    text: null,
    checkbox: null,
    clearBtn: null,
    isCompleted: false,

    init() {
        this.question = document.getElementById('focusQuestion');
        this.input = document.getElementById('focusInput');
        this.display = document.getElementById('focusDisplay');
        this.text = document.getElementById('focusText');
        this.checkbox = document.getElementById('focusCheckbox');
        this.clearBtn = document.getElementById('focusClear');

        // Check for new day - reset focus if so
        if (Storage.isNewDay()) {
            this.reset();
        } else {
            this.load();
        }

        this.bindEvents();
    },

    bindEvents() {
        // Submit focus on Enter
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.input.value.trim()) {
                this.setFocus(this.input.value.trim());
            }
        });

        // Toggle completion
        this.checkbox.addEventListener('change', () => {
            this.toggleComplete();
        });

        // Clear focus
        this.clearBtn.addEventListener('click', () => {
            this.reset();
        });
    },

    load() {
        const savedFocus = Storage.get('dailyFocus');
        if (savedFocus && savedFocus.text) {
            this.setFocus(savedFocus.text, savedFocus.completed);
        }
    },

    setFocus(focusText, completed = false) {
        this.text.textContent = focusText;
        this.isCompleted = completed;

        // Update UI
        this.question.style.display = 'none';
        this.input.style.display = 'none';
        this.display.classList.add('active');

        this.checkbox.checked = completed;
        if (completed) {
            this.text.classList.add('completed');
        } else {
            this.text.classList.remove('completed');
        }

        // Save
        Storage.set('dailyFocus', { text: focusText, completed });
    },

    toggleComplete() {
        this.isCompleted = this.checkbox.checked;

        if (this.isCompleted) {
            this.text.classList.add('completed');
        } else {
            this.text.classList.remove('completed');
        }

        // Save state
        Storage.set('dailyFocus', {
            text: this.text.textContent,
            completed: this.isCompleted
        });
    },

    reset() {
        this.question.style.display = 'block';
        this.input.style.display = 'block';
        this.input.value = '';
        this.display.classList.remove('active');
        this.text.textContent = '';
        this.text.classList.remove('completed');
        this.checkbox.checked = false;
        this.isCompleted = false;

        Storage.remove('dailyFocus');
    }
};
