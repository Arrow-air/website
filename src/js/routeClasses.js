export function onRouteDidUpdate({ location }) {
  document.documentElement.classList.toggle('docs-fullwidth', location.pathname.startsWith('/bounty'));
}
