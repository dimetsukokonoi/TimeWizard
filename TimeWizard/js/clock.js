/**
 * Clock Module (Enhanced)
 * Real-time digital clock with seconds option
 */

const Clock = {
  element: null,
  format: '12',
  showSeconds: false,

  init() {
    this.element = document.getElementById('clock');
    this.format = Storage.get('timeFormat', '12');
    this.showSeconds = Storage.get('showSeconds', false);
    this.update();
    setInterval(() => this.update(), 1000);
  },

  update() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    let timeStr;
    if (this.format === '12') {
      hours = hours % 12 || 12;
      timeStr = this.showSeconds 
        ? `${hours}:${minutes}:${seconds}`
        : `${hours}:${minutes}`;
    } else {
      timeStr = this.showSeconds
        ? `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`
        : `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    this.element.textContent = timeStr;
  },

  setFormat(format) {
    this.format = format;
    Storage.set('timeFormat', format);
    this.update();
  }
};
