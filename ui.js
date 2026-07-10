import { getImageUrl } from './api.js';
import { escapeHtml, truncateText, formatYear, formatFullDate, formatRuntime, formatRating } from './utils.js';

export const ICONS = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>',
  heartFilled: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.4 7 .7-5.3 4.8 1.6 6.9L12 17.8l-6.2 3.5 1.6-6.9-5.3-4.8 7-.7z"></path></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="7" y1="4" x2="7" y2="20"></line><line x1="17" y1="4" x2="17" y2="20"></line><line x1="2" y1="9" x2="7" y2="9"></line><line x1="2" y1="15" x2="7" y2="15"></line><line x1="17" y1="9" x2="22" y2="9"></line><line x1="17" y1="15" x2="22" y2="15"></line></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="M21 2l-9.6 9.6"></path><path d="M15.5 7.5L18 10"></path><path d="M13 10l2.5 2.5"></path></svg>',
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
};


function posterHTML(movie, size = 'w342') {
  const url = getImageUrl(movie.poster_path, size);
  if (url) {
    return `<img class="poster-img" src="${url}" alt="${escapeHtml(movie.title)} poster" loading="lazy">`;
  }
  return `<div class="poster-placeholder">${ICONS.film}</div>`;
}

export function movieCardHTML(movie, isFavorite) {
  const rating = formatRating(movie.vote_average);

  return `
    <article class="movie-card" data-id="${movie.id}">
      <a class="movie-card-link" href="movie.html?id=${movie.id}">
        <div class="poster-wrap">
          ${posterHTML(movie)}
          ${rating ? `<span class="rating-badge">${ICONS.star}${rating}</span>` : ''}
        </div>
        <div class="movie-card-info">
          <h3 class="movie-card-title">${escapeHtml(movie.title)}</h3>
          <span class="movie-card-year">${formatYear(movie.release_date)}</span>
        </div>
      </a>
      <button
        class="favorite-btn ${isFavorite ? 'is-active' : ''}"
        data-id="${movie.id}"
        aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
        aria-pressed="${isFavorite}"
      >${isFavorite ? ICONS.heartFilled : ICONS.heart}</button>
    </article>
  `;
}

export function renderMovieGrid(container, movies, isFavoriteFn) {
  container.innerHTML = movies.map((m) => movieCardHTML(m, isFavoriteFn(m.id))).join('');
}

export function renderSkeletons(container, count = 10) {
  container.innerHTML = Array.from({ length: count })
    .map(() => '<div class="movie-card-skeleton"><div class="skeleton-poster"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>')
    .join('');
}


export function renderMessageState(container, { icon = ICONS.film, title, message, actionHtml = '' }) {
  container.innerHTML = `
    <div class="state-block">
      <span class="state-icon">${icon}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      ${actionHtml}
    </div>
  `;
}

export function renderApiKeyNotice(container) {
  renderMessageState(container, {
    icon: ICONS.key,
    title: 'Add your TMDB API key to get started',
    message: 'Movie Explorer needs a free key from The Movie Database to load anything.',
    actionHtml: `
      <ol class="setup-steps">
        <li>Create a free account at themoviedb.org</li>
        <li>Go to Settings → API and request a key</li>
        <li>Open <code>js/api.js</code> and paste it into <code>API_KEY</code></li>
      </ol>
      <a class="btn btn-primary" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">Get an API key</a>
    `,
  });
}

export function renderErrorState(container, retryFn) {
  renderMessageState(container, {
    icon: ICONS.alert,
    title: 'Something went wrong',
    message: "Couldn't reach The Movie Database. Check your connection and try again.",
    actionHtml: '<button class="btn btn-primary" id="retryBtn">Try again</button>',
  });
  const retryBtn = document.getElementById('retryBtn');
  if (retryBtn && retryFn) retryBtn.addEventListener('click', retryFn);
}


export function renderMovieDetail(container, movie, isFavorite) {
  const backdropUrl = getImageUrl(movie.backdrop_path, 'w1280');
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const rating = formatRating(movie.vote_average);
  const runtime = formatRuntime(movie.runtime);
  const genres = (movie.genres || []).map((g) => escapeHtml(g.name)).join(' · ');

  container.innerHTML = `
    <div class="detail-hero" ${backdropUrl ? `style="background-image: linear-gradient(180deg, rgba(18,19,22,0.15), var(--color-bg) 92%), url('${backdropUrl}')"` : ''}>
      <div class="detail-hero-inner">
        <div class="detail-poster-wrap">
          ${posterUrl ? `<img class="detail-poster" src="${posterUrl}" alt="${escapeHtml(movie.title)} poster">` : `<div class="detail-poster detail-poster-placeholder">${ICONS.film}</div>`}
        </div>
        <div class="detail-info">
          <h1 class="detail-title">${escapeHtml(movie.title)}</h1>
          ${movie.tagline ? `<p class="detail-tagline">${escapeHtml(movie.tagline)}</p>` : ''}
          <div class="detail-meta">
            <span>${formatYear(movie.release_date)}</span>
            ${runtime ? `<span>${runtime}</span>` : ''}
            ${genres ? `<span>${genres}</span>` : ''}
          </div>
          <div class="detail-actions">
            ${rating ? `<span class="rating-badge rating-badge-lg">${ICONS.star}${rating}</span>` : ''}
            <button
              class="favorite-btn favorite-btn-detail btn ${isFavorite ? 'is-active btn-primary' : 'btn-secondary'}"
              data-id="${movie.id}"
              aria-pressed="${isFavorite}"
            >${isFavorite ? ICONS.heartFilled : ICONS.heart}<span>${isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span></button>
          </div>
        </div>
      </div>
    </div>

    <section class="detail-body">
      <h2>Overview</h2>
      <p class="overview-text">${escapeHtml(movie.overview) || 'No overview available.'}</p>

      ${renderCastSection(movie.credits?.cast)}
      ${renderSimilarSection(movie.similar?.results)}
    </section>
  `;
}

function renderCastSection(cast) {
  const top = (cast || []).slice(0, 12);
  if (!top.length) return '';

  const cards = top.map((person) => {
    const photoUrl = getImageUrl(person.profile_path, 'w185');
    return `
      <div class="cast-card">
        ${photoUrl
          ? `<img class="cast-photo" src="${photoUrl}" alt="${escapeHtml(person.name)}" loading="lazy">`
          : `<div class="cast-photo cast-photo-placeholder">${ICONS.person}</div>`}
        <span class="cast-name">${escapeHtml(person.name)}</span>
        <span class="cast-character">${escapeHtml(truncateText(person.character, 40))}</span>
      </div>
    `;
  }).join('');

  return `<h2>Cast</h2><div class="cast-scroll">${cards}</div>`;
}

function renderSimilarSection(similar) {
  const top = (similar || []).slice(0, 6);
  if (!top.length) return '';
  return `<h2>You might also like</h2><div class="movie-grid movie-grid-compact" id="similarGrid"></div>`;
}

export function updateFavoriteButtons(id, isFavorite) {
  document.querySelectorAll(`.favorite-btn[data-id="${id}"]`).forEach((btn) => {
    btn.classList.toggle('is-active', isFavorite);
    btn.setAttribute('aria-pressed', String(isFavorite));
    btn.innerHTML = isFavorite ? ICONS.heartFilled : ICONS.heart;

    if (btn.classList.contains('favorite-btn-detail')) {
      btn.classList.toggle('btn-primary', isFavorite);
      btn.classList.toggle('btn-secondary', !isFavorite);
      btn.innerHTML += `<span>${isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>`;
    } else {
      btn.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');
    }
  });
}

export function setPageTitle(title) {
  document.title = title ? `${title} · Movie Explorer` : 'Movie Explorer';
}

export function formatDetailDate(dateStr) {
  return formatFullDate(dateStr);
}
