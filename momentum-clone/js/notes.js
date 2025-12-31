/**
 * Notes Module
 * Quick notepad with auto-save
 */

const Notes = {
    panel: null,
    toggleBtn: null,
    textarea: null,
    countDisplay: null,
    clearBtn: null,
    saveTimeout: null,

    init() {
        this.panel = document.getElementById('notesPanel');
        this.toggleBtn = document.getElementById('notesBtn');
        this.textarea = document.getElementById('notesTextarea');
        this.countDisplay = document.getElementById('notesCount');
        this.clearBtn = document.getElementById('notesClear');

        // Load saved notes
        this.textarea.value = Storage.get('notes', '');
        this.updateCount();

        this.bindEvents();
    },

    bindEvents() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeOtherPanels();
            this.panel.classList.toggle('active');
            if (this.panel.classList.contains('active')) {
                this.textarea.focus();
            }
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });

        // Auto-save on typing
        this.textarea.addEventListener('input', () => {
            this.updateCount();
            this.autoSave();
        });

        // Clear notes
        this.clearBtn.addEventListener('click', () => {
            if (confirm('Clear all notes?')) {
                this.textarea.value = '';
                this.save();
                this.updateCount();
            }
        });
    },

    updateCount() {
        const count = this.textarea.value.length;
        this.countDisplay.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    },

    autoSave() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.save(), 500);
    },

    save() {
        Storage.set('notes', this.textarea.value);
    },

    closeOtherPanels() {
        document.querySelectorAll('.panel.active').forEach(p => {
            if (p !== this.panel) p.classList.remove('active');
        });
    }
};
