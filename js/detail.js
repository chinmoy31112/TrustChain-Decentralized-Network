/**
 * detail.js — Campaign detail page logic
 */

let currentCampaign = null;
let donationAmount = '';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = 'campaigns.html'; return; }

  await loadDetailPage(id);

  // Amount preset buttons
  document.querySelectorAll('.amount-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amount-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const input = document.getElementById('donateAmount');
      if (input) input.value = btn.dataset.amount;
      donationAmount = btn.dataset.amount;
    });
  });

  // Manual amount input - deselect presets
  document.getElementById('donateAmount')?.addEventListener('input', (e) => {
    donationAmount = e.target.value;
    document.querySelectorAll('.amount-preset').forEach(b => b.classList.remove('active'));
  });

  // Donate button
  document.getElementById('donateBtn')?.addEventListener('click', handleDonate);

  // Vote buttons
  document.getElementById('voteForBtn')?.addEventListener('click', () => castVote(true));
  document.getElementById('voteAgainstBtn')?.addEventListener('click', () => castVote(false));

  // Withdraw button
  document.getElementById('withdrawBtn')?.addEventListener('click', handleWithdraw);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });
});

window.addEventListener('walletConnected', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    await loadDetailPage(id);
  }
});

async function loadDetailPage(id) {
  currentCampaign = await loadCampaign(id);
  if (!currentCampaign) {
    document.getElementById('mainContent').innerHTML = `
      <div class="empty-state" style="padding:8rem 2rem">
        <div class="empty-state-icon">❌</div>
        <h3>Campaign Not Found</h3>
        <p>This campaign doesn't exist or hasn't been indexed yet.</p>
        <a href="campaigns.html" class="btn btn-primary">Browse Campaigns</a>
      </div>
    `;
    return;
  }

  renderDetail(currentCampaign);
  await loadDonors(id);
}

function renderDetail(c) {
  const pct      = utils.progress(c.raised, c.goal);
  const raisedEth = utils.formatEth(c.raised);
  const goalEth   = utils.formatEth(c.goal);
  const catIcon   = utils.categoryIcon(c.category);
  const imgSrc    = c.imageUrl || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format';
  const now       = Math.floor(Date.now() / 1000);
  const isEnded   = Number(c.deadline) < now || !c.active;
  const isOwner   = W3.address && W3.address.toLowerCase() === c.creator?.toLowerCase();
  const goalMet   = pct >= 100;

  // Breadcrumb & title
  document.title = c.title + ' — CharityFund';

  const main = document.getElementById('mainContent');
  if (!main) return;

  main.innerHTML = `
    <div class="page-header">
      <div class="container">
        <p class="text-muted mb-2">
          <a href="campaigns.html" class="text-teal">← Campaigns</a> / ${escHtml(c.title)}
        </p>
      </div>
    </div>

    <div class="container" style="padding-bottom:5rem">
      <div class="campaign-detail-grid">

        <!-- Main Content -->
        <div>
          <div style="position:relative; margin-bottom:1.5rem">
            <img
              src="${imgSrc}"
              alt="${escHtml(c.title)}"
              class="detail-hero-img"
              onerror="this.src='https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format'"
            />
            <div style="position:absolute;top:16px;left:16px;display:flex;gap:0.5rem">
              <span class="badge badge-purple">${catIcon} ${escHtml(c.category)}</span>
              ${utils.statusBadge(c)}
            </div>
          </div>

          <h1 style="font-size:2rem;margin-bottom:1rem">${escHtml(c.title)}</h1>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:2rem">
            By <span class="text-teal" style="font-family:monospace">${utils.shortAddr(c.creator)}</span>
            &nbsp;·&nbsp; Deadline: ${new Date(Number(c.deadline)*1000).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </p>

          <!-- Progress -->
          <div class="card" style="padding:1.5rem;margin-bottom:2rem">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1rem">
              <div>
                <div style="font-size:2rem;font-weight:900;color:var(--teal)">${raisedEth} MNT</div>
                <div style="color:var(--text-secondary);font-size:0.85rem">raised of ${goalEth} MNT goal</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:1.4rem;font-weight:800">${pct}%</div>
                <div style="color:var(--text-secondary);font-size:0.85rem">${utils.timeLeft(c.deadline)}</div>
              </div>
            </div>
            <div class="progress-bar-outer" style="height:10px">
              <div class="progress-bar-inner" id="detailProgressBar" style="width:0%"></div>
            </div>
            <div style="display:flex;gap:2rem;margin-top:1rem">
              <div><span style="font-weight:700">${c.donorCount || 0}</span> <span style="color:var(--text-secondary);font-size:0.85rem">donors</span></div>
              <div><span style="font-weight:700">${c.voteCount || 0}</span> <span style="color:var(--text-secondary);font-size:0.85rem">supporting</span></div>
              <div><span style="font-weight:700">${c.againstCount || 0}</span> <span style="color:var(--text-secondary);font-size:0.85rem">against</span></div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button class="tab-btn active" data-tab="tab-about">About</button>
            <button class="tab-btn" data-tab="tab-donors">Donors</button>
            <button class="tab-btn" data-tab="tab-governance">Governance</button>
          </div>

          <div id="tab-about" class="tab-panel active">
            <div style="line-height:1.8;color:var(--text-secondary);white-space:pre-wrap">${escHtml(c.description)}</div>
          </div>

          <div id="tab-donors" class="tab-panel">
            <div id="donorList" class="donor-list">
              <div class="page-loader"><div class="spinner"></div></div>
            </div>
          </div>

          <div id="tab-governance" class="tab-panel">
            <h3 style="margin-bottom:1rem">Community Vote</h3>
            <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem">
              Vote to show your support or raise concerns about this campaign. Any wallet can vote.
            </p>

            <div class="vote-bar-wrap">
              <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.85rem">
                <span>Support (${c.voteCount || 0})</span>
                <span>Against (${c.againstCount || 0})</span>
              </div>
              <div class="vote-bar-outer">
                ${(() => {
                  const total = (Number(c.voteCount) + Number(c.againstCount)) || 1;
                  const pctFor = Math.round(Number(c.voteCount) / total * 100);
                  return `<div class="vote-bar-inner" style="width:${pctFor}%"></div>`;
                })()}
              </div>
            </div>

            <div style="display:flex;gap:0.75rem;margin-top:1.5rem">
              <button id="voteForBtn" class="btn btn-primary" ${isEnded ? 'disabled' : ''}>
                👍 Support Campaign
              </button>
              <button id="voteAgainstBtn" class="btn btn-danger" ${isEnded ? 'disabled' : ''}>
                👎 Vote Against
              </button>
            </div>
            <p style="color:var(--text-muted);font-size:0.78rem;margin-top:0.75rem">
              Each wallet can only vote once per campaign
            </p>
          </div>

          ${isOwner ? `
          <div class="card" style="padding:1.25rem;margin-top:2rem;border-color:rgba(0,212,170,0.25)">
            <h4 style="margin-bottom:0.75rem;color:var(--teal)">⚡ Creator Controls</h4>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
              <button id="withdrawBtn" class="btn btn-primary" ${c.withdrawn || (!goalMet && !isEnded) ? 'disabled' : ''}>
                💰 Withdraw Funds
              </button>
              <button onclick="handleClose('${c.id}')" class="btn btn-danger" ${!c.active ? 'disabled' : ''}>
                🔒 Close Campaign
              </button>
            </div>
            ${c.withdrawn ? '<p style="color:var(--teal);font-size:0.82rem;margin-top:0.5rem">✓ Funds have been withdrawn</p>' : ''}
          </div>
          ` : ''}
        </div>

        <!-- Sidebar: Donate Card -->
        <div class="sticky">
          <div class="card donate-card">
            <h3>Make a Donation</h3>

            ${isEnded || c.withdrawn ? `
              <div class="badge badge-gray" style="font-size:0.85rem;padding:0.5rem 1rem;margin-bottom:1rem">
                This campaign is no longer accepting donations
              </div>
            ` : ''}

            <div class="amount-presets">
              <button class="amount-preset" data-amount="0.01">0.01 MNT</button>
              <button class="amount-preset" data-amount="0.05">0.05 MNT</button>
              <button class="amount-preset" data-amount="0.1">0.1 MNT</button>
              <button class="amount-preset" data-amount="0.5">0.5 MNT</button>
              <button class="amount-preset" data-amount="1">1 MNT</button>
              <button class="amount-preset" data-amount="5">5 MNT</button>
            </div>

            <div class="form-group">
              <label class="form-label">Custom Amount</label>
              <div class="input-group">
                <input
                  type="number"
                  id="donateAmount"
                  class="form-control"
                  placeholder="0.0"
                  min="0.001"
                  step="0.001"
                  ${isEnded || c.withdrawn ? 'disabled' : ''}
                />
                <span class="input-addon">MNT</span>
              </div>
              <p class="form-hint" id="donateUsdPreview"></p>
            </div>

            <button
              id="donateBtn"
              class="btn btn-primary w-full btn-lg"
              ${isEnded || c.withdrawn ? 'disabled' : ''}
            >
              ❤️ Donate Now
            </button>

            <p style="font-size:0.75rem;color:var(--text-muted);text-align:center;margin-top:0.75rem">
              You'll receive an NFT receipt for your donation
            </p>

            <div class="divider"></div>

            <div class="donate-stats">
              <div class="donate-stat-item">
                <div class="donate-stat-value">${raisedEth}</div>
                <div class="donate-stat-label">MNT Raised</div>
              </div>
              <div class="donate-stat-item">
                <div class="donate-stat-value">${c.donorCount || 0}</div>
                <div class="donate-stat-label">Donors</div>
              </div>
              <div class="donate-stat-item">
                <div class="donate-stat-value">${pct}%</div>
                <div class="donate-stat-label">Funded</div>
              </div>
              <div class="donate-stat-item">
                <div class="donate-stat-value">${utils.timeLeft(c.deadline).split(' ')[0]}</div>
                <div class="donate-stat-label">${utils.timeLeft(c.deadline).includes('d') ? 'Days Left' : 'Time Left'}</div>
              </div>
            </div>

            <div class="divider"></div>

            <div style="font-size:0.78rem;color:var(--text-muted)">
              <p>🔒 Funds secured by smart contract on Ethereum</p>
              <p style="margin-top:0.4rem">🧾 NFT receipt minted automatically to your wallet</p>
              <p style="margin-top:0.4rem">📊 100% transparent — all transactions on-chain</p>
            </div>
          </div>

          <!-- Share card -->
          <div class="card" style="padding:1.25rem;margin-top:1rem">
            <p style="font-size:0.85rem;font-weight:600;margin-bottom:0.75rem">Share Campaign</p>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-secondary btn-sm" onclick="shareTwitter()">🐦 Twitter</button>
              <button class="btn btn-secondary btn-sm" onclick="utils.copy(window.location.href)">🔗 Copy Link</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Animate progress bar
  requestAnimationFrame(() => {
    const bar = document.getElementById('detailProgressBar');
    if (bar) bar.style.width = pct + '%';
  });

  // Bind donate amount USD preview
  document.getElementById('donateAmount')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const preview = document.getElementById('donateUsdPreview');
    if (preview && !isNaN(val) && val > 0) {
      preview.textContent = `≈ $${(val * 3200).toLocaleString()} USD`;
    } else if (preview) {
      preview.textContent = '';
    }
  });

  // Re-bind vote and other buttons
  document.getElementById('donateBtn')?.addEventListener('click', handleDonate);
  document.getElementById('voteForBtn')?.addEventListener('click', () => castVote(true));
  document.getElementById('voteAgainstBtn')?.addEventListener('click', () => castVote(false));
  document.getElementById('withdrawBtn')?.addEventListener('click', handleWithdraw);

  // Amount presets
  document.querySelectorAll('.amount-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amount-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const input = document.getElementById('donateAmount');
      if (input) {
        input.value = btn.dataset.amount;
        const preview = document.getElementById('donateUsdPreview');
        if (preview) preview.textContent = `≈ $${(parseFloat(btn.dataset.amount) * 3200).toLocaleString()} USD`;
      }
    });
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });
}

async function loadDonors(campaignId) {
  const list = document.getElementById('donorList');
  if (!list) return;

  let donors = [];
  if (W3.fundContract) {
    try {
      donors = await W3.fundContract.getCampaignDonors(campaignId);
    } catch {}
  }

  if (!donors.length) {
    list.innerHTML = `
      <div class="empty-state" style="padding:2rem">
        <div class="empty-state-icon">💝</div>
        <h3>Be the first donor!</h3>
        <p>No donations yet. Donate to get your NFT receipt.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = donors.map((addr, i) => `
    <div class="donor-item">
      <div class="donor-avatar" style="${utils.avatarStyle(addr)}">${utils.initials(addr)}</div>
      <span class="donor-addr">${utils.shortAddr(addr)}</span>
      <span class="donor-amount">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''} Donor</span>
    </div>
  `).join('');
}

async function handleDonate() {
  if (!W3.isConnected) {
    const ok = await connectWallet();
    if (!ok) return;
  }

  if (!W3.fundContract) {
    toast.error('Contract not deployed on this network. Switch to a supported network or deploy contracts first.');
    return;
  }

  const amountInput = document.getElementById('donateAmount');
  const amount = amountInput?.value?.trim();

  if (!amount || !utils.isValidEth(amount)) {
    toast.error('Enter a valid donation amount');
    return;
  }

  const minDonation = 0.0001;
  if (parseFloat(amount) < minDonation) {
    toast.error(`Minimum donation is ${minDonation} MNT`);
    return;
  }

  const btn = document.getElementById('donateBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Processing…';

  try {
    const value = ethers.parseEther(amount);
    const tx = await W3.fundContract.donate(currentCampaign.id, { value });

    toast.info('Transaction submitted! Waiting for confirmation…', 8000);
    const receipt = await tx.wait();

    const event = receipt.events?.find(e => e.event === 'DonationMade');
    const tokenId = event?.args?.tokenId?.toString();

    toast.success(`Donated ${amount} MNT! 🎉 NFT Receipt #${tokenId} minted to your wallet.`, 7000);

    // Refresh page data
    setTimeout(() => window.location.reload(), 2000);

  } catch (err) {
    const msg = parseError(err);
    toast.error('Donation failed: ' + msg);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '❤️ Donate Now';
  }
}

async function castVote(support) {
  if (!W3.isConnected) {
    const ok = await connectWallet();
    if (!ok) return;
  }

  if (!W3.fundContract) {
    toast.error('Contract not available. Please deploy first.');
    return;
  }

  // Check if already voted
  try {
    const voted = await W3.fundContract.hasVoted(currentCampaign.id, W3.address);
    if (voted) { toast.warning('You have already voted on this campaign'); return; }
  } catch {}

  const btn = support ? document.getElementById('voteForBtn') : document.getElementById('voteAgainstBtn');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';

  try {
    const tx = await W3.fundContract.vote(currentCampaign.id, support);
    toast.info('Vote submitted…', 5000);
    await tx.wait();
    toast.success(support ? '👍 Vote cast in support!' : '👎 Vote cast against');
    setTimeout(() => window.location.reload(), 1500);
  } catch (err) {
    toast.error('Vote failed: ' + parseError(err));
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

async function handleWithdraw() {
  if (!W3.fundContract) return;

  const btn = document.getElementById('withdrawBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Withdrawing…';

  try {
    const tx = await W3.fundContract.withdraw(currentCampaign.id);
    toast.info('Withdrawal initiated…', 5000);
    await tx.wait();
    toast.success('Funds withdrawn successfully! 💵');
    setTimeout(() => window.location.reload(), 1500);
  } catch (err) {
    toast.error('Withdrawal failed: ' + parseError(err));
    btn.disabled = false;
    btn.textContent = '💰 Withdraw Funds';
  }
}

async function handleClose(id) {
  if (!confirm('Close this campaign? This action cannot be undone.')) return;
  if (!W3.fundContract) return;

  try {
    const tx = await W3.fundContract.closeCampaign(id);
    await tx.wait();
    toast.success('Campaign closed');
    setTimeout(() => window.location.reload(), 1500);
  } catch (err) {
    toast.error('Failed: ' + parseError(err));
  }
}

function shareTwitter() {
  const text = encodeURIComponent(`Support "${currentCampaign?.title}" on CharityFund — a decentralized charity platform 💚`);
  const url = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function parseError(err) {
  if (err.code === 4001) return 'Rejected by user';
  if (err.reason) return err.reason;
  return err.message?.slice(0, 80) || 'Unknown error';
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
