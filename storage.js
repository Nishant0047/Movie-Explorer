const KEYS = {
  FAVORITES: 'movieexplorer_favorites',
  THEME: 'movieexplorer_theme',
};

export class StorageManager {
  isAvailable() {
    try {
      const testKey = '__movieexplorer_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (err) {
      return false;
    }
  }

  getFavorites() {
    try {
      const raw = localStorage.getItem(KEYS.FAVORITES);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Movie Explorer: failed to read favorites', err);
      return [];
    }
  }

  setFavorites(list) {
    try {
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify(list));
      return true;
    } catch (err) {
      console.error('Movie Explorer: failed to save favorites', err);
      return false;
    }
  }

  getTheme() {
    try {
      return localStorage.getItem(KEYS.THEME);
    } catch (err) {
      return null;
    }
  }

  setTheme(theme) {
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch (err) {
      console.error('Movie Explorer: failed to save theme', err);
    }
  }
}
