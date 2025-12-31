/**
 * Storage Utility Module
 * Handles localStorage operations with JSON parsing
 */

const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  // Check if it's a new day (resets at 4 AM)
  isNewDay() {
    const lastDate = this.get('lastActiveDate');
    const now = new Date();
    const resetHour = 4; // 4 AM reset time
    
    // Get today's date considering 4 AM reset
    const today = new Date(now);
    if (now.getHours() < resetHour) {
      today.setDate(today.getDate() - 1);
    }
    const todayStr = today.toDateString();
    
    if (lastDate !== todayStr) {
      this.set('lastActiveDate', todayStr);
      return true;
    }
    return false;
  }
};
