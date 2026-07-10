import { StorageManager } from './storage.js';

export class FavoritesManager {
  constructor() {
    this.storage = new StorageManager();
    this.favorites = this.storage.getFavorites();
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    this.listeners.forEach((listener) => listener(this.getAll()));
  }

  getAll() {
    return [...this.favorites];
  }

  isFavorite(id) {
    return this.favorites.some((m) => m.id === id);
  }

  toggle(movie) {
    if (this.isFavorite(movie.id)) {
      this.favorites = this.favorites.filter((m) => m.id !== movie.id);
    } else {
      this.favorites.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        release_date: movie.release_date || null,
        vote_average: movie.vote_average || 0,
      });
    }
    this.storage.setFavorites(this.favorites);
    this._notify();
    return this.isFavorite(movie.id);
  }
}
