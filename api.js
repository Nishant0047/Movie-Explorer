const API_KEY = 'YOUR_TMDB_API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export class ApiKeyMissingError extends Error {
  constructor() {
    super('TMDB API key is missing or invalid. Add yours in js/api.js.');
    this.name = 'ApiKeyMissingError';
  }
}

export function isApiKeyConfigured() {
  return Boolean(API_KEY) && API_KEY !== 'YOUR_TMDB_API_KEY';
}

async function request(endpoint, params = {}) {
  if (!isApiKeyConfigured()) {
    throw new ApiKeyMissingError();
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString());

  if (!res.ok) {
    if (res.status === 401) throw new ApiKeyMissingError();
    throw new Error(`TMDB request failed (${res.status})`);
  }

  return res.json();
}

export function searchMovies(query, page = 1) {
  return request('/search/movie', { query, page, include_adult: false });
}

export function getPopularMovies(page = 1) {
  return request('/movie/popular', { page });
}

export function getTrendingMovies() {
  return request('/trending/movie/week', {});
}

export function getMovieDetails(id) {
  return request(`/movie/${id}`, { append_to_response: 'credits,similar' });
}


export function getImageUrl(path, size = 'w500') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}
