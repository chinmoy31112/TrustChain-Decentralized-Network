/**
 * web3.js — MetaMask connection & ethers.js provider management
 * Shared across all pages
 */

// State
window.W3 = {
  provider:   null,
  signer:     null,
  address:    null,
  chainId:    null,
  fundContract: null,
  nftContract:  null,
  isConnected: false,
};

// ── Toast Notifications ────────────────────────────────────
window.toast = (function () {
  let container = null;

  function ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  function icons() {
    return { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  }

  function show(message, type = 'info', duration = 4000) {
    ensureContainer();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons()[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  return {
    success: (m, d) => show(m, 'success', d),
    error:   (m, d) => show(m, 'error', d),
    info:    (m, d) => show(m, 'info', d),
    warning: (m, d) => show(m, 'warning', d),
  };
})();

// ── Utility Helpers ────────────────────────────────────────
window.utils = {
  // Format ETH from wei (string or BigNumber)
  formatEth(wei, decimals = 4) {
    try {
      const val = ethers.utils.formatEther(wei.toString());
      return parseFloat(val).toFixed(decimals).replace(/\.?0+$/, '');
    } catch { return '0'; }
  },

  // Format wei to ETH with unit label
  formatEthLabel(wei) {
    const eth = parseFloat(ethers.utils.formatEther(wei.toString()));
    if (eth >= 1000) return (eth / 1000).toFixed(2) + 'K ETH';
    return eth.toFixed(4) + ' ETH';
  },

  // Shorten address
  shortAddr(addr) {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  },

  // Progress percentage
  progress(raised, goal) {
    if (!goal || goal === '0') return 0;
    const pct = (BigInt(raised.toString()) * 100n) / BigInt(goal.toString());
    return Math.min(Number(pct), 100);
  },

  // Time remaining text
  timeLeft(deadline) {
    const now = Math.floor(Date.now() / 1000);
    const diff = Number(deadline) - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  },

  // Category emoji
  categoryIcon(cat) {
    const map = {
      'Education': '📚', 'Healthcare': '🏥', 'Disaster Relief': '🆘',
      'Environment': '🌿', 'Hunger': '🍱', 'Animal Welfare': '🐾',
      'Community': '🤝', 'Other': '💡',
    };
    return map[cat] || '💡';
  },

  // Status badge
  statusBadge(c) {
    const now = Math.floor(Date.now() / 1000);
    if (!c.active || c.withdrawn) return '<span class="badge badge-gray">Closed</span>';
    if (Number(c.deadline) < now)   return '<span class="badge badge-red">Expired</span>';
    const pct = utils.progress(c.raised, c.goal);
    if (pct >= 100)                  return '<span class="badge badge-teal">Goal Met ✓</span>';
    return '<span class="badge badge-purple">Active</span>';
  },

  // Badge tier for donor
  donorBadge(amountWei) {
    const eth = parseFloat(ethers.utils.formatEther(amountWei.toString()));
    if (eth >= 1)    return { label: 'Diamond', color: 'badge-teal' };
    if (eth >= 0.1)  return { label: 'Gold',    color: 'badge-gold' };
    if (eth >= 0.01) return { label: 'Silver',  color: 'badge-gray' };
    return             { label: 'Bronze',  color: 'badge-gray' };
  },

  // Get initials from address
  initials(addr) {
    if (!addr) return '?';
    return (addr.slice(2, 4)).toUpperCase();
  },

  // Copy to clipboard
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed');
    }
  },

  // Format large numbers
  formatNum(n) {
    const num = Number(n);
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  },

  // Validate ETH amount
  isValidEth(val) {
    return /^\d*\.?\d+$/.test(val.trim()) && parseFloat(val) > 0;
  },

  // Build explorer URL
  explorerTx(hash) {
    const net = window.NETWORKS[W3.chainId];
    if (!net || !net.explorer) return '#';
    return `${net.explorer}/tx/${hash}`;
  },

  // Generate gradient avatar color
  avatarStyle(addr) {
    if (!addr) return '';
    const hue = parseInt(addr.slice(-4), 16) % 360;
    return `background: linear-gradient(135deg, hsl(${hue},70%,50%), hsl(${(hue+80)%360},70%,40%))`;
  }
};

// ── MetaMask / Web3 Connection ─────────────────────────────
async function connectWallet() {
  if (!window.ethereum) {
    toast.error('MetaMask not found! Please install it from metamask.io');
    window.open('https://metamask.io/download/', '_blank');
    return false;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts.length) throw new Error('No accounts returned');

    await _initWeb3(accounts[0]);
    toast.success(`Connected: ${utils.shortAddr(W3.address)}`);
    return true;
  } catch (err) {
    if (err.code === 4001) {
      toast.warning('Connection rejected by user');
    } else {
      toast.error('Failed to connect: ' + (err.message || 'Unknown error'));
    }
    return false;
  }
}

async function _initWeb3(account) {
  W3.provider = new ethers.providers.Web3Provider(window.ethereum);
  W3.signer   = W3.provider.getSigner();
  W3.address  = ethers.utils.getAddress(account);
  const network = await W3.provider.getNetwork();
  W3.chainId  = network.chainId;
  W3.isConnected = true;

  // Load contracts
  const addrs = window.CONTRACT_ADDRESSES[W3.chainId];
  if (addrs && addrs.CharityFund) {
    W3.fundContract = new ethers.Contract(addrs.CharityFund, window.CHARITY_FUND_ABI, W3.signer);
    W3.nftContract  = new ethers.Contract(addrs.CharityNFT,  window.CHARITY_NFT_ABI,  W3.signer);
  }

  // Update all wallet UI elements
  _updateWalletUI();

  // Emit custom event for page-specific handlers
  window.dispatchEvent(new CustomEvent('walletConnected', { detail: { address: W3.address, chainId: W3.chainId } }));
}

function disconnectWallet() {
  W3.provider   = null;
  W3.signer     = null;
  W3.address    = null;
  W3.chainId    = null;
  W3.fundContract = null;
  W3.nftContract  = null;
  W3.isConnected  = false;
  _updateWalletUI();
  window.dispatchEvent(new CustomEvent('walletDisconnected'));
}

function _updateWalletUI() {
  // Wallet address displays
  document.querySelectorAll('[data-wallet-addr]').forEach(el => {
    el.textContent = W3.isConnected ? utils.shortAddr(W3.address) : 'Not connected';
  });

  // Wallet dots
  document.querySelectorAll('.wallet-dot').forEach(dot => {
    dot.classList.toggle('disconnected', !W3.isConnected);
  });

  // Connect buttons
  document.querySelectorAll('[data-connect-btn]').forEach(btn => {
    btn.textContent = W3.isConnected ? utils.shortAddr(W3.address) : 'Connect Wallet';
    if (W3.isConnected) btn.classList.add('btn-secondary');
  });

  // Network badge
  document.querySelectorAll('[data-network-name]').forEach(el => {
    const net = window.NETWORKS[W3.chainId];
    el.textContent = net ? net.name : (W3.isConnected ? `Chain ${W3.chainId}` : '');
  });
}

// ── Auto-reconnect (check if already connected) ────────────
async function tryAutoConnect() {
  if (!window.ethereum) return;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) await _initWeb3(accounts[0]);
  } catch {}
}

// ── Listeners ──────────────────────────────────────────────
if (window.ethereum) {
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (!accounts.length) {
      disconnectWallet();
      toast.info('Wallet disconnected');
    } else {
      await _initWeb3(accounts[0]);
      toast.info(`Switched to ${utils.shortAddr(accounts[0])}`);
    }
  });

  window.ethereum.on('chainChanged', () => {
    toast.info('Network changed — reloading…');
    setTimeout(() => window.location.reload(), 1000);
  });
}

// ── DOM Ready ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Bind connect buttons
  document.querySelectorAll('[data-connect-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (W3.isConnected) {
        // Show address copy option
        utils.copy(W3.address);
      } else {
        connectWallet();
      }
    });
  });

  // Mobile menu
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.navbar-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop() || '';
    if (href === currentPage) link.classList.add('active');
  });

  // Try auto-connect
  tryAutoConnect();
});

// ── Modal Helper ───────────────────────────────────────────
window.openModal = function(id) {
  document.getElementById(id)?.classList.remove('hidden');
};
window.closeModal = function(id) {
  document.getElementById(id)?.classList.add('hidden');
};

// ── Smart Contract Helpers ─────────────────────────────────

// Load campaigns — uses live data if connected, demo otherwise
async function loadCampaigns() {
  if (W3.fundContract) {
    try {
      return await W3.fundContract.getAllCampaigns();
    } catch (e) {
      console.error('Contract read failed:', e);
    }
  }
  return window.DEMO_CAMPAIGNS;
}

// Load single campaign
async function loadCampaign(id) {
  if (W3.fundContract) {
    try {
      return await W3.fundContract.getCampaign(id);
    } catch {}
  }
  return window.DEMO_CAMPAIGNS.find(c => c.id == id) || null;
}

// Load global stats
async function loadStats() {
  if (W3.fundContract) {
    try {
      const [campaigns, raised, donors] = await W3.fundContract.getStats();
      return { campaigns: campaigns.toString(), raised: raised.toString(), donors: donors.toString() };
    } catch {}
  }
  return {
    campaigns: window.DEMO_CAMPAIGNS.length.toString(),
    raised: window.DEMO_CAMPAIGNS.reduce((a, c) => a + BigInt(c.raised), 0n).toString(),
    donors: '2041'
  };
}

// Counter animation
function animateCounter(el, target, isEth = false) {
  const duration = 2000;
  const start = performance.now();
  const startVal = 0;

  function update(time) {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startVal + (target - startVal) * eased;

    if (isEth) {
      el.textContent = current.toFixed(1) + ' ETH';
    } else {
      el.textContent = utils.formatNum(Math.floor(current));
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Expose globals
window.connectWallet   = connectWallet;
window.disconnectWallet = disconnectWallet;
window.loadCampaigns   = loadCampaigns;
window.loadCampaign    = loadCampaign;
window.loadStats       = loadStats;
window.animateCounter  = animateCounter;
