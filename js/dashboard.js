/**
 * dashboard.js — Donor dashboard page logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

window.addEventListener('walletConnected', () => {
  initDashboard();
});

window.addEventListener('walletDisconnected', () => {
  document.getElementById('connectPrompt')?.classList.remove('hidden');
  document.getElementById('dashContent')?.classList.add('hidden');
});

async function initDashboard() {
  if (!W3.isConnected) {
    document.getElementById('connectPrompt')?.classList.remove('hidden');
    document.getElementById('dashContent')?.classList.add('hidden');
    await renderLeaderboard(); // Show leaderboard regardless
    return;
  }

  document.getElementById('connectPrompt')?.classList.add('hidden');
  document.getElementById('dashContent')?.classList.remove('hidden');

  await Promise.all([
    renderMyStats(),
    renderMyCampaigns(),
    renderMyNFTs(),
    renderLeaderboard(),
  ]);
}

async function renderMyStats() {
  if (!W3.address) return;

  let stats = { totalDonated: '0', donationCount: '0' };
  if (W3.fundContract) {
    try {
      const s = await W3.fundContract.donorStats(W3.address);
      stats = { totalDonated: s.totalDonated.toString(), donationCount: s.donationCount.toString() };
    } catch {}
  }

  const ethDonated = utils.formatEth(stats.totalDonated);
  const badge = utils.donorBadge(stats.totalDonated);

  document.getElementById('myAddrDisplay')?.setAttribute('title', W3.address);
  document.getElementById('myAddrDisplay').textContent = utils.shortAddr(W3.address);

  document.getElementById('myTotalDonated').textContent = ethDonated + ' ETH';
  document.getElementById('myDonationCount').textContent = stats.donationCount;

  const badgeEl = document.getElementById('myBadge');
  if (badgeEl) {
    badgeEl.textContent = badge.label + ' Donor';
    badgeEl.className = `badge ${badge.color}`;
  }

  // NFT count
  if (W3.nftContract) {
    try {
      const bal = await W3.nftContract.balanceOf(W3.address);
      document.getElementById('myNFTCount').textContent = bal.toString();
    } catch {}
  }
}

async function renderMyCampaigns() {
  const container = document.getElementById('myCampaigns');
  if (!container) return;

  let campaigns = await loadCampaigns();
  const mine = campaigns.filter(c =>
    c.creator?.toLowerCase() === W3.address?.toLowerCase()
  );

  if (!mine.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No campaigns yet</h3>
        <p>You haven't created any campaigns</p>
        <a href="create-campaign.html" class="btn btn-primary">Create Campaign</a>
      </div>
    `;
    return;
  }

  container.innerHTML = mine.map(c => {
    const pct = utils.progress(c.raised, c.goal);
    return `
      <div class="card" style="padding:1.25rem;margin-bottom:0.75rem;cursor:pointer"
           onclick="window.location='campaign-detail.html?id=${c.id}'">
        <div style="display:flex;align-items:center;gap:1rem">
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;margin-bottom:0.25rem">${escHtml(c.title)}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary)">${utils.formatEth(c.raised)} / ${utils.formatEth(c.goal)} ETH raised</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            ${utils.statusBadge(c)}
            <div style="font-size:0.85rem;font-weight:700;color:var(--teal);margin-top:0.25rem">${pct}%</div>
          </div>
        </div>
        <div class="progress-bar-outer" style="margin-top:0.75rem">
          <div class="progress-bar-inner" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

async function renderMyNFTs() {
  const container = document.getElementById('myNFTs');
  if (!container || !W3.nftContract) {
    if (container) container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎨</div>
        <h3>No NFTs yet</h3>
        <p>Donate to campaigns to receive NFT receipts</p>
      </div>
    `;
    return;
  }

  try {
    const balance = await W3.nftContract.balanceOf(W3.address);
    const total = await W3.nftContract.totalSupply();
    const myTokens = [];

    // Scan all tokens to find ones owned by the user (simple approach)
    for (let i = 1; i <= total.toNumber() && myTokens.length < 20; i++) {
      try {
        const owner = await W3.nftContract.ownerOf(i);
        if (owner.toLowerCase() === W3.address.toLowerCase()) {
          const receipt = await W3.nftContract.receipts(i);
          myTokens.push({ id: i, ...receipt });
        }
      } catch {}
    }

    if (!myTokens.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎨</div>
          <h3>No NFTs yet</h3>
          <p>Donate to campaigns to receive NFT receipts</p>
          <a href="campaigns.html" class="btn btn-primary">Donate Now</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="grid-3">${myTokens.map(t => nftCardHTML(t)).join('')}</div>`;

  } catch (err) {
    container.innerHTML = `<p style="color:var(--text-secondary)">Could not load NFTs</p>`;
  }
}

function nftCardHTML(token) {
  const amount   = utils.formatEth(token.amount);
  const badgeColors = { Diamond: 'badge-teal', Gold: 'badge-gold', Silver: 'badge-gray', Bronze: 'badge-gray' };
  const badgeCls = badgeColors[token.badge] || 'badge-gray';
  const date = new Date(Number(token.timestamp) * 1000).toLocaleDateString();

  return `
    <div class="card nft-card">
      <div style="
        background: linear-gradient(135deg, #0a0a1a, #1a0a2e);
        aspect-ratio: 4/5;
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        padding:1.5rem;text-align:center;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      ">
        <div style="font-size:3rem;margin-bottom:0.75rem">🏅</div>
        <div style="font-weight:800;font-size:1.2rem;background:var(--gradient-main);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
          ${amount} ETH
        </div>
        <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:0.25rem">${escHtml(token.campaignTitle || '')}</div>
        <span class="badge ${badgeCls}" style="margin-top:0.75rem">${token.badge}</span>
      </div>
      <div class="nft-card-body">
        <div class="nft-card-title">Receipt #${token.id}</div>
        <div class="nft-card-sub">Campaign #${token.campaignId} &nbsp;·&nbsp; ${date}</div>
      </div>
    </div>
  `;
}

async function renderLeaderboard() {
  const container = document.getElementById('leaderboard');
  if (!container) return;

  let wallets = [], amounts = [];
  let useDemo = true;

  if (W3.fundContract) {
    try {
      const [w, a] = await W3.fundContract.getLeaderboard(10);
      wallets = w; amounts = a;
      useDemo = false;
    } catch {}
  }

  if (useDemo) {
    wallets = window.DEMO_LEADERBOARD.map(d => d.address);
    amounts = window.DEMO_LEADERBOARD.map(d => d.total);
  }

  if (!wallets.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🏆</div><h3>No donors yet</h3></div>`;
    return;
  }

  container.innerHTML = wallets.map((addr, i) => {
    const amountEth = utils.formatEth(amounts[i]);
    const badge = utils.donorBadge(amounts[i]);
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
    const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
    const isMe = W3.address && addr.toLowerCase() === W3.address.toLowerCase();

    return `
      <div class="leaderboard-item ${isMe ? 'card-gradient' : ''}">
        <div class="lb-rank ${rankClass}">${rankIcon}</div>
        <div class="lb-avatar" style="${utils.avatarStyle(addr)}">${utils.initials(addr)}</div>
        <div class="lb-info">
          <div class="lb-address">${utils.shortAddr(addr)} ${isMe ? '<span class="badge badge-teal">You</span>' : ''}</div>
          <div class="lb-count"><span class="badge ${badge.color}">${badge.label}</span></div>
        </div>
        <div class="lb-amount">${amountEth} ETH</div>
      </div>
    `;
  }).join('');
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
