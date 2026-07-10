import { debounce, buildSearchUrl } from './utils.js';

/**
 * @param {(query: string) => void} onSearch
 */
export function initSearch(onSearch) {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  if (!input) return;

  const isHomePage = document.body.dataset.page === 'home';

  const runSearch = (query) => {
    if (isHomePage) {
      onSearch(query);
    } else if (query) {
      window.location.href = buildSearchUrl(query);
    }
  };

  if (isHomePage) {
    input.addEventListener('input', debounce((e) => runSearch(e.target.value.trim()), 400));
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      runSearch(input.value.trim());
    });
  }
}

export function setSearchValue(value) {
  const input = document.getElementById('searchInput');
  if (input) input.value = value || '';
}
