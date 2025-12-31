/**
 * Mantras Module
 * Personal affirmations display
 */

const Mantras = {
    container: null,
    textElement: null,
    mantra: '',

    init() {
        this.container = document.getElementById('mantraContainer');
        this.textElement = document.getElementById('mantraText');

        this.mantra = Storage.get('mantra', '');
        this.render();
    },

    setMantra(text) {
        this.mantra = text;
        Storage.set('mantra', text);
        this.render();
    },

    render() {
        if (this.mantra) {
            this.textElement.textContent = this.mantra;
            this.container.style.display = 'block';
        } else {
            this.container.style.display = 'none';
        }
    }
};
