import * as api from './api.js';
import * as ui from './ui.js';
import { FavoritesManager } from './favorites.js';
import { initSearch, setSearchValue } from './search.js';
import { initTheme } from './theme.js';
import { getQueryParam } from './utils.js';

const favorites = new FavoritesManager();

function wireFavoriteButtons(scopeEl) {
  scopeEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.favorite-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const id = Number(btn.dataset.id);
    const movie = movieCache.get(id);
    if (!movie) return;

    const isFav = favorites.toggle(movie);
    ui.updateFavoriteButtons(id, isFav);
  });
}

const movieCache = new Map();
function registerMovies(movies) {
  movies.forEach((m) => movieCache.set(m.id, m));
}


async function initHomePage() {
  const grid = document.getElementById('movieGrid');
  const trendingSection = document.getElementById('trendingSection');
  const trendingGrid = document.getElementById('trendingGrid');
  const heading = document.getElementById('resultsHeading');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  wireFavoriteButtons(document.body);

  if (!api.isApiKeyConfigured()) {
    trendingSection.hidden = true;
    ui.renderApiKeyNotice(grid);
    return;
  }

  const state = { query: getQueryParam('q') || '', page: 1, totalPages: 1 };
  setSearchValue(state.query);

  async function loadTrending() {
    try {
      const data = await api.getTrendingMovies();
      registerMovies(data.results);
      ui.renderMovieGrid(trendingGrid, data.results.slice(0, 10), (id) => favorites.isFavorite(id));
    } catch (err) {
      trendingSection.hidden = true;
    }
  }

  async function loadMovies(page, replace) {
    heading.textContent = state.query ? `Results for “${state.query}”` : 'Popular movies';
    trendingSection.hidden = Boolean(state.query);

    if (replace) ui.renderSkeletons(grid);
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading…';

    try {
      const data = state.query
        ? await api.searchMovies(state.query, page)
        : await api.getPopularMovies(page);

      state.totalPages = data.total_pages || 1;
      registerMovies(data.results);

      if (replace) {
        if (!data.results.length) {
          ui.renderMessageState(grid, {
            icon: ui.ICONS.search,
            title: 'No results found',
            message: `Nothing matched “${state.query}”. Try a different search.`,
          });
        } else {
          ui.renderMovieGrid(grid, data.results, (id) => favorites.isFavorite(id));
        }
      } else {
        const container = document.createElement('div');
        container.innerHTML = data.results.map((m) => ui.movieCardHTML(m, favorites.isFavorite(m.id))).join('');
        Array.from(container.children).forEach((card) => grid.appendChild(card));
      }

      loadMoreBtn.hidden = state.page >= state.totalPages;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load more';
    } catch (err) {
      loadMoreBtn.hidden = true;
      if (err.name === 'ApiKeyMissingError') {
        ui.renderApiKeyNotice(grid);
      } else {
        ui.renderErrorState(grid, () => loadMovies(state.page, true));
      }
    }
  }

  loadMoreBtn.addEventListener('click', () => {
    state.page += 1;
    loadMovies(state.page, false);
  });

  initSearch((query) => {
    state.query = query;
    state.page = 1;
    loadMovies(1, true);
  });

  loadTrending();
  loadMovies(1, true);
}


async function initDetailPage() {
  const content = document.getElementById('detailContent');
  const id = Number(getQueryParam('id'));

  wireFavoriteButtons(document.body);
  initSearch(() => {});

  if (!id) {
    ui.renderMessageState(content, {
      icon: ui.ICONS.alert,
      title: 'Movie not found',
      message: 'No movie was specified. Head back and pick one from the grid.',
      actionHtml: '<a class="btn btn-primary" href="index.html">Back to browsing</a>',
    });
    return;
  }

  if (!api.isApiKeyConfigured()) {
    ui.renderApiKeyNotice(content);
    return;
  }

  try {
    const movie = await api.getMovieDetails(id);
    registerMovies([movie]);
    ui.setPageTitle(movie.title);
    ui.renderMovieDetail(content, movie, favorites.isFavorite(movie.id));

    const similarGrid = document.getElementById('similarGrid');
    if (similarGrid && movie.similar?.results?.length) {
      const similar = movie.similar.results.slice(0, 6);
      registerMovies(similar);
      ui.renderMovieGrid(similarGrid, similar, (mid) => favorites.isFavorite(mid));
    }
  } catch (err) {
    if (err.name === 'ApiKeyMissingError') {
      ui.renderApiKeyNotice(content);
    } else {
      ui.renderMessageState(content, {
        icon: ui.ICONS.alert,
        title: 'Couldn\u2019t load this movie',
        message: 'It may not exist, or The Movie Database is unreachable right now.',
        actionHtml: '<a class="btn btn-primary" href="index.html">Back to browsing</a>',
      });
    }
  }
}


function initFavoritesPage() {
  const grid = document.getElementById('favoritesGrid');
  wireFavoriteButtons(document.body);
  initSearch(() => {});

  function render() {
    const list = favorites.getAll();
    if (!list.length) {
      ui.renderMessageState(grid, {
        icon: ui.ICONS.heart,
        title: 'No favorites yet',
        message: 'Tap the heart on any movie to save it here.',
        actionHtml: '<a class="btn btn-primary" href="index.html">Start exploring</a>',
      });
      return;
    }
    registerMovies(list);
    ui.renderMovieGrid(grid, list, () => true);
  }

  favorites.subscribe(render);
  render();
}


document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  switch (document.body.dataset.page) {
    case 'home':
      initHomePage();
      break;
    case 'detail':
      initDetailPage();
      break;
    case 'favorites':
      initFavoritesPage();
      break;
    default:
      break;
  }
});
