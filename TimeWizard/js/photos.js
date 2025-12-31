/**
 * Photos Module
 * Custom background photo management
 */

const Photos = {
    panel: null,
    toggleBtn: null,
    customInput: null,
    customUrl: null,
    setBtn: null,
    skipBtn: null,
    shuffleBtn: null,
    photoSource: 'default',

    init() {
        this.panel = document.getElementById('photosPanel');
        this.toggleBtn = document.getElementById('photosBtn');
        this.customInput = document.getElementById('customPhotoInput');
        this.customUrl = document.getElementById('customPhotoUrl');
        this.setBtn = document.getElementById('setCustomPhoto');
        this.skipBtn = document.getElementById('skipPhoto');
        this.shuffleBtn = document.getElementById('shufflePhoto');

        this.photoSource = Storage.get('photoSource', 'default');

        this.bindEvents();
        this.updateRadios();
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

        // Radio buttons
        document.querySelectorAll('input[name="photoSource"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.photoSource = e.target.value;
                Storage.set('photoSource', this.photoSource);
                this.customInput.style.display = this.photoSource === 'custom' ? 'flex' : 'none';

                if (this.photoSource === 'default') {
                    Background.setBackground();
                }
            });
        });

        // Set custom photo
        this.setBtn.addEventListener('click', () => this.setCustomPhoto());

        // Skip photo
        this.skipBtn.addEventListener('click', () => {
            Background.nextBackground();
        });

        // Shuffle
        this.shuffleBtn.addEventListener('click', () => {
            Background.shuffleBackground();
        });
    },

    setCustomPhoto() {
        const url = this.customUrl.value.trim();
        if (!url) return;

        // Test if image loads
        const img = new Image();
        img.onload = () => {
            Storage.set('customPhotoUrl', url);
            Background.setCustomBackground(url);
            this.customUrl.value = '';
        };
        img.onerror = () => {
            alert('Could not load image. Please check the URL.');
        };
        img.src = url;
    },

    updateRadios() {
        document.querySelectorAll('input[name="photoSource"]').forEach(radio => {
            radio.checked = radio.value === this.photoSource;
        });
        this.customInput.style.display = this.photoSource === 'custom' ? 'flex' : 'none';

        // Load custom photo if set
        if (this.photoSource === 'custom') {
            const customUrl = Storage.get('customPhotoUrl');
            if (customUrl) {
                Background.setCustomBackground(customUrl);
            }
        }
    },

    closeOtherPanels() {
        document.querySelectorAll('.panel.active').forEach(p => {
            if (p !== this.panel) p.classList.remove('active');
        });
    }
};
