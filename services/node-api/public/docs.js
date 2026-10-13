// Live status badge + catalogue summary for the API docs page (same-origin fetch).
(async () => {
  const badge = document.getElementById('status');
  try {
    const health = await fetch('/api/health').then((r) => r.json());
    badge.textContent = health.db ? 'API up · DB up' : 'API up · DB down';
    badge.className = `badge ${health.db ? 'up' : 'down'}`;
  } catch {
    badge.textContent = 'API unreachable';
    badge.className = 'badge down';
  }
  try {
    const cat = await fetch('/api/catalogue').then((r) => r.json());
    document.getElementById('catalogue-summary').textContent =
      `Catalogue: ${cat.machines.length} machines, ${cat.services.length} services in MySQL.`;
  } catch {
    /* catalogue optional on this page */
  }
})();
