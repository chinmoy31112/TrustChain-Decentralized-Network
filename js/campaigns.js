/**
 * campaigns.js — Browse/filter campaigns page logic
 */

let allCampaigns = [];
let activeCategory = 'all';
let activeStatus = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initCampaignsPage();
});

window.addEventListener('walletConnected', () => {
  initCampaignsPage();
});

async function initCampaignsPage() {
  showLoadingState();
  allCampaigns = await loadCampaigns();
  renderCampaigns();

  // Category buttons
  document.querySelectorAll('.filter-tab[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      renderCampaigns();
    });
  });

  // Status filter
  document.querySelectorAll('.filter-tab[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.dataset.status;
      renderCampaigns();
    });
  });

  // Search
  const searchEl = document.getElementById('campaignSearch');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderCampaigns();
    });
  }
}

function showLoadingState() {
  const grid = document.getElementById('campaignsGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="page-loader" style="grid-column:1/-1">
      <div class="spinner"></div>
      <span>Loading campaigns...</span>
    </div>
  `;
}

function filterCampaigns() {
  const now = Math.floor(Date.now() / 1000);
  return allCampaigns.filter(c => {
    // Category filter
    if (activeCategory !== 'all' && c.category !== activeCategory) return false;

    // Status filter
    if (activeStatus === 'active' && (!c.active || Number(c.deadline) < now)) return false;
    if (activeStatus === 'completed' && !(Number(c.raised) >= Number(c.goal) || !c.active)) return false;
    if (activeStatus === 'ended' && Number(c.deadline) >= now) return false;

    // Search
    if (searchQuery) {
      const haystack = (c.title + c.description + c.category).toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }

    return true;
  });
}

function renderCampaigns() {
  const grid = document.getElementById('campaignsGrid');
  const countEl = document.getElementById('campaignCount');
  if (!grid) return;

  const filtered = filterCampaigns();
  if (countEl) countEl.textContent = filtered.length;

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <h3>No campaigns found</h3>
        <p>Try adjusting your filters or search terms</p>
        <button class="btn btn-outline" onclick="resetFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((c, i) => campaignCardHTML(c, i)).join('');

  // Animate progress bars
  requestAnimationFrame(() => {
    grid.querySelectorAll('.progress-bar-inner').forEach(bar => {
      const pct = bar.dataset.pct;
      bar.style.width = pct + '%';
    });
  });
}

function campaignCardHTML(c, i) {
  const pct = utils.progress(c.raised, c.goal);
  const raisedEth = utils.formatEth(c.raised);
  const goalEth   = utils.formatEth(c.goal);
  const catIcon   = utils.categoryIcon(c.category);
  const delay     = `stagger-${Math.min((i % 6) + 1, 6)}`;
  const imgSrc    = c.imageUrl || `https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format`;
  const status    = utils.statusBadge(c);

  return `
    <article class="card campaign-card fade-up ${delay}" onclick="window.location='campaign-detail.html?id=${c.id}'">
      <div class="campaign-card-img-wrapper">
        <img
          src="${imgSrc}"
          alt="${escHtml(c.title)}"
          class="campaign-card-img"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format'"
        />
        <span class="badge badge-purple" style="position:absolute;top:12px;left:12px">
          ${catIcon} ${escHtml(c.category)}
        </span>
      </div>
      <div class="campaign-card-body">
        <h3 class="campaign-card-title">${escHtml(c.title)}</h3>
        <p class="campaign-card-desc">${escHtml(c.description)}</p>

        <div class="progress-wrap">
          <div class="progress-info">
            <span class="progress-raised">${raisedEth} MNT</span>
            <span class="progress-goal">of ${goalEth} MNT</span>
          </div>
          <div class="progress-bar-outer">
            <div class="progress-bar-inner" data-pct="${pct}" style="width:0%"></div>
          </div>
        </div>

        <div class="campaign-card-meta">
          <span>${status}</span>
          <span>⏱ ${utils.timeLeft(c.deadline)}</span>
          <span>👥 ${c.donorCount || 0}</span>
        </div>
      </div>
    </article>
  `;
}

function resetFilters() {
  activeCategory = 'all';
  activeStatus = 'all';
  searchQuery = '';

  document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.filter-tab[data-cat="all"]')?.classList.add('active');
  document.querySelector('.filter-tab[data-status="all"]')?.classList.add('active');

  const searchEl = document.getElementById('campaignSearch');
  if (searchEl) searchEl.value = '';

  renderCampaigns();
}

function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
