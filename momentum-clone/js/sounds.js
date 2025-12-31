/**
 * Sounds Module - Local Files Only
 * Ambient sounds with MIXER functionality and individual volume controls
 */

const Sounds = {
    panel: null,
    toggleBtn: null,
    activeSounds: {},
    audioElements: {},
    soundVolumes: {},
    masterVolume: 0.5,

    // =============================================
    // LOCAL SOUNDS ONLY
    // =============================================

    sounds: {
        lightRain: { name: 'Light Rain', emoji: '🌧️', color: '#60A5FA', url: 'assets/sounds/Light Rain.mp3' },
        heavyRain: { name: 'Heavy Rain', emoji: '⛈️', color: '#3B82F6', url: 'assets/sounds/Heavy Rain.mp3' },
        ocean: { name: 'Ocean', emoji: '🌊', color: '#0EA5E9', url: 'assets/sounds/Ocean.mp3' },
        jungle: { name: 'Jungle', emoji: '🌴', color: '#22C55E', url: 'assets/sounds/Jungle.mp3' },
        campfire: { name: 'Campfire', emoji: '🔥', color: '#F97316', url: 'assets/sounds/Campfire.mp3' },
        bell: { name: 'Bell', emoji: '🔔', color: '#A855F7', url: 'assets/sounds/bell.mp3' }
    },

    // =============================================
    // INITIALIZATION
    // =============================================

    init() {
        this.panel = document.getElementById('soundsPanel');
        this.toggleBtn = document.getElementById('soundsBtn');

        this.masterVolume = Storage.get('soundMasterVolume', 50) / 100;
        this.soundVolumes = Storage.get('soundVolumes', {});

        this.renderPanel();
        this.bindEvents();
        this.loadSavedSounds();
    },

    // =============================================
    // RENDER PANEL
    // =============================================

    renderPanel() {
        const panelContent = `
            <div class="sounds-header">
                <h3>🎧 Sound Mixer</h3>
                <button class="stop-all-btn" id="stopAllSounds" title="Stop All">⏹</button>
            </div>
            
            <div class="sounds-content-wrapper" id="soundsContentWrapper">
                <div class="sounds-grid">
                    ${Object.entries(this.sounds).map(([key, sound]) => `
                        <button class="sound-btn ${this.activeSounds[key] ? 'active' : ''}" 
                                data-sound="${key}"
                                style="--sound-color: ${sound.color}"
                                title="${sound.name}">
                            <span class="sound-emoji">${sound.emoji}</span>
                            <span class="sound-name">${sound.name}</span>
                            ${this.activeSounds[key] ? '<span class="playing-indicator">♪</span>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="mixer-section" id="mixerSection">
                <div class="mixer-header">
                    <span class="mixer-label">🎛️ Mixer</span>
                    <span class="active-count" id="activeCount">0 active</span>
                </div>
                <div class="mixer-tracks" id="mixerTracks">
                    <div class="no-sounds-message">Select sounds to mix</div>
                </div>
            </div>
            
            <div class="master-volume-section">
                <label class="master-label">🔊 Master Volume</label>
                <div class="volume-slider-container">
                    <input type="range" id="masterVolume" min="0" max="100" value="${this.masterVolume * 100}">
                    <span class="volume-value" id="masterVolumeValue">${Math.round(this.masterVolume * 100)}%</span>
                </div>
            </div>
        `;

        this.panel.innerHTML = panelContent;
        this.updateMixerDisplay();
    },

    // =============================================
    // EVENT BINDING
    // =============================================

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

        this.panel.addEventListener('click', (e) => {
            if (e.target.closest('.sound-btn')) {
                const btn = e.target.closest('.sound-btn');
                const sound = btn.dataset.sound;
                this.toggleSound(sound, btn);
            }

            if (e.target.id === 'stopAllSounds' || e.target.closest('#stopAllSounds')) {
                this.stopAll();
            }

            if (e.target.classList.contains('track-remove')) {
                const sound = e.target.dataset.sound;
                this.stopSound(sound);
                this.updateMixerDisplay();
                this.updateSoundButtons();
            }
        });

        this.panel.addEventListener('input', (e) => {
            if (e.target.id === 'masterVolume') {
                this.masterVolume = e.target.value / 100;
                Storage.set('soundMasterVolume', e.target.value);
                document.getElementById('masterVolumeValue').textContent = `${Math.round(this.masterVolume * 100)}%`;
                this.updateAllVolumes();
            }

            if (e.target.classList.contains('track-volume')) {
                const sound = e.target.dataset.sound;
                this.soundVolumes[sound] = e.target.value / 100;
                Storage.set('soundVolumes', this.soundVolumes);
                this.updateSoundVolume(sound);

                const label = e.target.parentElement.querySelector('.track-volume-value');
                if (label) label.textContent = `${e.target.value}%`;
            }
        });
    },

    // =============================================
    // SOUND CONTROL
    // =============================================

    toggleSound(soundName, btn) {
        if (this.activeSounds[soundName]) {
            this.stopSound(soundName);
            btn.classList.remove('active');
            btn.querySelector('.playing-indicator')?.remove();
        } else {
            this.playSound(soundName);
            btn.classList.add('active');
            if (!btn.querySelector('.playing-indicator')) {
                btn.insertAdjacentHTML('beforeend', '<span class="playing-indicator">♪</span>');
            }
        }
        this.updateMixerDisplay();
        this.saveSounds();
    },

    playSound(soundName) {
        const source = this.sounds[soundName];
        if (!source) return;

        if (this.soundVolumes[soundName] === undefined) {
            this.soundVolumes[soundName] = 0.7;
        }

        const audio = new Audio(source.url);
        audio.loop = true;
        audio.volume = this.masterVolume * this.soundVolumes[soundName];
        audio.play().catch(e => console.log('Audio play failed:', e));

        this.audioElements[soundName] = audio;
        this.activeSounds[soundName] = {
            name: source.name,
            emoji: source.emoji,
            color: source.color
        };
    },

    stopSound(soundName) {
        if (this.audioElements[soundName]) {
            this.audioElements[soundName].pause();
            this.audioElements[soundName].currentTime = 0;
            delete this.audioElements[soundName];
        }
        delete this.activeSounds[soundName];
        this.saveSounds();
    },

    stopAll() {
        Object.keys(this.activeSounds).forEach(key => {
            this.stopSound(key);
        });
        this.updateMixerDisplay();
        this.updateSoundButtons();
    },

    updateSoundVolume(soundName) {
        if (this.audioElements[soundName]) {
            this.audioElements[soundName].volume = this.masterVolume * (this.soundVolumes[soundName] || 0.7);
        }
    },

    updateAllVolumes() {
        Object.keys(this.audioElements).forEach(key => {
            this.updateSoundVolume(key);
        });
    },

    // =============================================
    // MIXER DISPLAY
    // =============================================

    updateMixerDisplay() {
        const mixerTracks = document.getElementById('mixerTracks');
        const activeCount = document.getElementById('activeCount');
        const activeList = Object.entries(this.activeSounds);

        if (activeCount) {
            activeCount.textContent = `${activeList.length} active`;
        }

        if (!mixerTracks) return;

        if (activeList.length === 0) {
            mixerTracks.innerHTML = '<div class="no-sounds-message">Select sounds to mix</div>';
        } else {
            mixerTracks.innerHTML = activeList.map(([key, sound]) => {
                const volume = Math.round((this.soundVolumes[key] || 0.7) * 100);
                return `
                    <div class="mixer-track" style="--track-color: ${sound.color}">
                        <div class="track-info">
                            <span class="track-emoji">${sound.emoji}</span>
                            <span class="track-name">${sound.name}</span>
                        </div>
                        <div class="track-controls">
                            <input type="range" class="track-volume" data-sound="${key}" 
                                   min="0" max="100" value="${volume}">
                            <span class="track-volume-value">${volume}%</span>
                            <button class="track-remove" data-sound="${key}" title="Remove">×</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        this.toggleBtn.classList.toggle('active', activeList.length > 0);
    },

    updateSoundButtons() {
        this.panel.querySelectorAll('.sound-btn').forEach(btn => {
            const sound = btn.dataset.sound;
            const isActive = !!this.activeSounds[sound];
            btn.classList.toggle('active', isActive);

            const indicator = btn.querySelector('.playing-indicator');
            if (isActive && !indicator) {
                btn.insertAdjacentHTML('beforeend', '<span class="playing-indicator">♪</span>');
            } else if (!isActive && indicator) {
                indicator.remove();
            }
        });
    },

    // =============================================
    // PERSISTENCE
    // =============================================

    saveSounds() {
        const toSave = Object.keys(this.activeSounds);
        Storage.set('activeSounds', toSave);
        Storage.set('soundVolumes', this.soundVolumes);
    },

    loadSavedSounds() {
        const saved = Storage.get('activeSounds', []);
        saved.forEach(soundName => {
            if (this.sounds[soundName]) {
                this.playSound(soundName);
            }
        });
        this.updateMixerDisplay();
        this.updateSoundButtons();
    },

    // =============================================
    // UTILITIES
    // =============================================

    closeOtherPanels() {
        document.querySelectorAll('.panel.active').forEach(p => {
            if (p !== this.panel) p.classList.remove('active');
        });
    },

    getAllSounds() {
        return { ...this.sounds };
    }
};
