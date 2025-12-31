/**
 * Background Module
 * Full-screen background images with skip/shuffle
 */

const Background = {
    backgrounds: [
        { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', photographer: 'Samuel Ferrara' },
        { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80', photographer: 'David Marcu' },
        { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=80', photographer: 'Robert Lukeman' },
        { url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&q=80', photographer: 'Jeff Sheldon' },
        { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80', photographer: 'Vince Fleming' },
        { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80', photographer: 'Pietro De Grandi' },
        { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80', photographer: 'Robert Bye' },
        { url: 'https://images.unsplash.com/photo-1518173946687-a4c036bc1e4f?w=1920&q=80', photographer: 'Johannes Plenio' },
        { url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80', photographer: 'Luca Bravo' },
        { url: 'https://images.unsplash.com/photo-1482784160316-6eb046863ece?w=1920&q=80', photographer: 'Jakub Kriz' },
        { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80', photographer: 'Samuel Scrimshaw' },
        { url: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80', photographer: 'Patrick Hendry' },
        { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', photographer: 'Kalen Emsley' },
        { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', photographer: 'Benjamin Voros' },
        { url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80', photographer: 'Ian Schneider' },
        { url: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=1920&q=80', photographer: 'Joshua Earle' },
        { url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80', photographer: 'Casey Horner' },
        { url: 'https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?w=1920&q=80', photographer: 'Cristina Gottardi' },
        { url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&q=80', photographer: 'Tim Swaan' },
        { url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1920&q=80', photographer: 'Daniel Seßler' }
    ],
    element: null,
    creditElement: null,
    currentIndex: 0,

    init() {
        this.element = document.getElementById('background');
        this.creditElement = document.getElementById('photographerName');

        // Check if custom photo is set
        const photoSource = Storage.get('photoSource', 'default');
        if (photoSource === 'custom') {
            const customUrl = Storage.get('customPhotoUrl');
            if (customUrl) {
                this.setCustomBackground(customUrl);
                return;
            }
        }

        this.currentIndex = Storage.get('bgIndex', this.getDayOfYear() % this.backgrounds.length);
        this.setBackground();
    },

    setBackground() {
        const bg = this.backgrounds[this.currentIndex];

        // Preload image
        const img = new Image();
        img.onload = () => {
            this.element.style.backgroundImage = `url(${bg.url})`;
            this.creditElement.textContent = bg.photographer;
        };
        img.src = bg.url;

        // Set fallback gradient immediately
        this.element.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    },

    setCustomBackground(url) {
        this.element.style.backgroundImage = `url(${url})`;
        this.creditElement.textContent = 'Custom';
    },

    nextBackground() {
        this.currentIndex = (this.currentIndex + 1) % this.backgrounds.length;
        Storage.set('bgIndex', this.currentIndex);
        this.setBackground();
    },

    shuffleBackground() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.backgrounds.length);
        } while (newIndex === this.currentIndex && this.backgrounds.length > 1);

        this.currentIndex = newIndex;
        Storage.set('bgIndex', this.currentIndex);
        this.setBackground();
    },

    getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
};
