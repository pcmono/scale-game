const THEME_KEY = 'concert-b-flat-scale-quest-theme';

export function readTheme(storage) {
  try { return storage?.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

export function applyTheme(root, theme, button, storage) {
  const dark = theme === 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  if (button) {
    button.setAttribute('aria-pressed', String(dark));
    button.textContent = dark ? '☀ Light mode' : '☾ Dark mode';
  }
  try { storage?.setItem(THEME_KEY, root.dataset.theme); }
  catch { /* Browsers that block local storage still allow the toggle. */ }
}

export function initTheme(root = document.documentElement, button = document.getElementById('theme-toggle')) {
  let storage;
  try { storage = window.localStorage; } catch { /* The page still works without storage. */ }
  applyTheme(root, readTheme(storage), button);
  button?.addEventListener('click', () => {
    applyTheme(root, root.dataset.theme === 'dark' ? 'light' : 'dark', button, storage);
  });
}
