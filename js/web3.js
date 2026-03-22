/**
 * web3.js — Wallet connection & ethers.js provider management
 * Supports MetaMask, Phantom, OKX, Coinbase, Brave, and any injected wallet
 * Configured for Mantle Network
 */

// ══════════════════════════════════════════════════════════════
// Global State
// ══════════════════════════════════════════════════════════════
window.W3 = {
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  fundContract: null,
  nftContract: null,
  isConnected: false,
  walletType: null
};

// ══════════════════════════════════════════════════════════════
// Toast Notifications
// ══════════════════════════════════════════════════════════════
window.toast = (function() {
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
    error: (m, d) => show(m, 'error', d),
    info: (m, d) => show(m, 'info', d),
    warning: (m, d) => show(m, 'warning', d)
  };
})();

// ══════════════════════════════════════════════════════════════
// Utility Helpers
// ══════════════════════════════════════════════════════════════
window.utils = {
  formatEth(wei, decimals = 4) {
    try {
      const val = ethers.formatEther(wei.toString());
      return parseFloat(val).toFixed(decimals).replace(/\.?0+$/, '') || '0';
    } catch {
      return '0';
    }
  },

  formatEthLabel(wei) {
    const eth = parseFloat(ethers.formatEther(wei.toString()));
    if (eth >= 1000) return (eth / 1000).toFixed(2) + 'K MNT';
    return eth.toFixed(4) + ' MNT';
  },

  shortAddr(addr) {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  },

  progress(raised, goal) {
    if (!goal || goal === '0') return 0;
    const pct = (BigInt(raised.toString()) * 100n) / BigInt(goal.toString());
    return Math.min(Number(pct), 100);
  },

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

  categoryIcon(cat) {
    const map = {
      'Education': '📚', 'Healthcare': '🏥', 'Disaster Relief': '🆘',
      'Environment': '🌿', 'Hunger': '🍱', 'Animal Welfare': '🐾',
      'Community': '🤝', 'Technology': '💻', 'Other': '💡'
    };
    return map[cat] || '💡';
  },

  statusBadge(c) {
    const now = Math.floor(Date.now() / 1000);
    if (!c.active || c.withdrawn) return '<span class="badge badge-gray">Closed</span>';
    if (Number(c.deadline) < now) return '<span class="badge badge-red">Expired</span>';
    const pct = utils.progress(c.raised, c.goal);
    if (pct >= 100) return '<span class="badge badge-teal">Goal Met ✓</span>';
    return '<span class="badge badge-purple">Active</span>';
  },

  donorBadge(amountWei) {
    const eth = parseFloat(ethers.formatEther(amountWei.toString()));
    if (eth >= 1) return { label: 'Diamond', color: 'badge-teal' };
    if (eth >= 0.1) return { label: 'Gold', color: 'badge-gold' };
    if (eth >= 0.01) return { label: 'Silver', color: 'badge-gray' };
    return { label: 'Bronze', color: 'badge-bronze' };
  },

  initials(addr) {
    if (!addr) return '?';
    return (addr.slice(2, 4)).toUpperCase();
  },

  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed');
    }
  },

  formatNum(n) {
    const num = Number(n);
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  },

  isValidEth(val) {
    return /^\d*\.?\d+$/.test(val.trim()) && parseFloat(val) > 0;
  },

  explorerTx(hash) {
    const net = window.NETWORKS[W3.chainId];
    if (!net || !net.explorer) return '#';
    return `${net.explorer}/tx/${hash}`;
  },

  explorerAddress(addr) {
    const net = window.NETWORKS[W3.chainId];
    if (!net || !net.explorer) return '#';
    return `${net.explorer}/address/${addr}`;
  },

  avatarStyle(addr) {
    if (!addr) return '';
    const hue = parseInt(addr.slice(-4), 16) % 360;
    return `background: linear-gradient(135deg, hsl(${hue},70%,50%), hsl(${(hue + 80) % 360},70%,40%))`;
  }
};

// ══════════════════════════════════════════════════════════════
// Wallet Detection
// ══════════════════════════════════════════════════════════════
function detectWalletProvider() {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  // Check for specific wallet types
  const eth = window.ethereum;

  if (eth.isMetaMask) return { provider: eth, type: 'MetaMask' };
  if (eth.isPhantom) return { provider: eth, type: 'Phantom' };
  if (eth.isOKExWallet || eth.isOkxWallet) return { provider: eth, type: 'OKX' };
  if (eth.isCoinbaseWallet) return { provider: eth, type: 'Coinbase' };
  if (eth.isBraveWallet) return { provider: eth, type: 'Brave' };

  // Handle multiple providers (e.g., when MetaMask and Coinbase both installed)
  if (eth.providers && eth.providers.length > 0) {
    // Prefer MetaMask
    const mm = eth.providers.find(p => p.isMetaMask);
    if (mm) return { provider: mm, type: 'MetaMask' };
    return { provider: eth.providers[0], type: 'Injected' };
  }

  return { provider: eth, type: 'Injected' };
}

// ══════════════════════════════════════════════════════════════
// Network Switching
// ══════════════════════════════════════════════════════════════
async function switchToMantleNetwork(targetChainId = window.DEFAULT_CHAIN_ID) {
  const provider = window.ethereum;
  if (!provider) return false;

  const chainIdHex = '0x' + targetChainId.toString(16);
  const network = window.NETWORKS[targetChainId];

  if (!network) {
    toast.error('Unknown network');
    return false;
  }

  try {
    // Try to switch
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }]
    });
    return true;
  } catch (switchError) {
    // Chain not added, try to add it
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: network.name,
            nativeCurrency: {
              name: network.currency,
              symbol: network.currency,
              decimals: network.decimals
            },
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: network.explorer ? [network.explorer] : []
          }]
        });
        return true;
      } catch (addError) {
        console.error('Failed to add network:', addError);
        toast.error('Failed to add Mantle network');
        return false;
      }
    }

    if (switchError.code === 4001) {
      toast.warning('Network switch rejected');
    } else {
      console.error('Switch error:', switchError);
      toast.error('Failed to switch network');
    }
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// Wallet Connection
// ══════════════════════════════════════════════════════════════
async function connectWallet() {
  const detected = detectWalletProvider();

  if (!detected) {
    toast.error('No wallet found! Please install MetaMask or another Web3 wallet.');
    window.open('https://metamask.io/download/', '_blank');
    return false;
  }

  const { provider, type } = detected;
  W3.walletType = type;

  try {
    // Request permissions (more secure than just eth_requestAccounts)
    try {
      await provider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
    } catch (permError) {
      // Some wallets don't support wallet_requestPermissions, fall back
      console.log('wallet_requestPermissions not supported, using eth_requestAccounts');
    }

    // Get accounts
    const accounts = await provider.request({ method: 'eth_requestAccounts' });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned');
    }

    // Check network and switch if needed
    const chainId = await provider.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId, 16);

    if (!window.NETWORKS[currentChainId]) {
      toast.info('Switching to Mantle Network...');
      const switched = await switchToMantleNetwork();
      if (!switched) {
        toast.warning('Please switch to Mantle Network manually');
      }
    }

    // Initialize Web3
    await _initWeb3(accounts[0], provider);
    toast.success(`Connected: ${utils.shortAddr(W3.address)} via ${type}`);
    return true;

  } catch (err) {
    console.error('Connection error:', err);
    if (err.code === 4001) {
      toast.warning('Connection rejected by user');
    } else {
      toast.error('Failed to connect: ' + (err.message || 'Unknown error'));
    }
    return false;
  }
}

async function _initWeb3(account, ethereumProvider = window.ethereum) {
  W3.provider = new ethers.BrowserProvider(ethereumProvider);
  W3.signer = await W3.provider.getSigner();
  W3.address = await W3.signer.getAddress();

  const network = await W3.provider.getNetwork();
  W3.chainId = Number(network.chainId);
  W3.isConnected = true;

  // Load contracts
  const addrs = window.CONTRACT_ADDRESSES[W3.chainId];
  if (addrs && addrs.CharityFund) {
    W3.fundContract = new ethers.Contract(addrs.CharityFund, window.CHARITY_FUND_ABI, W3.signer);
    W3.nftContract = new ethers.Contract(addrs.CharityNFT, window.CHARITY_NFT_ABI, W3.signer);
  } else {
    W3.fundContract = null;
    W3.nftContract = null;
  }

  _updateWalletUI();

  // Dispatch event
  window.dispatchEvent(new CustomEvent('walletConnected', {
    detail: { address: W3.address, chainId: W3.chainId, walletType: W3.walletType }
  }));
}

function disconnectWallet() {
  W3.provider = null;
  W3.signer = null;
  W3.address = null;
  W3.chainId = null;
  W3.fundContract = null;
  W3.nftContract = null;
  W3.isConnected = false;
  W3.walletType = null;

  _updateWalletUI();
  window.dispatchEvent(new CustomEvent('walletDisconnected'));
  toast.info('Wallet disconnected');
}

function _updateWalletUI() {
  // Wallet address displays
  document.querySelectorAll('[data-wallet-addr]').forEach(el => {
    el.textContent = W3.isConnected ? utils.shortAddr(W3.address) : 'Not connected';
  });

  // Full address displays
  document.querySelectorAll('[data-wallet-full]').forEach(el => {
    el.textContent = W3.isConnected ? W3.address : '';
  });

  // Wallet dots
  document.querySelectorAll('.wallet-dot').forEach(dot => {
    dot.classList.toggle('disconnected', !W3.isConnected);
    dot.classList.toggle('connected', W3.isConnected);
  });

  // Connect buttons
  document.querySelectorAll('[data-connect-btn]').forEach(btn => {
    if (W3.isConnected) {
      btn.innerHTML = `<span class="wallet-icon"></span>${utils.shortAddr(W3.address)}`;
      btn.classList.add('connected');
    } else {
      btn.textContent = 'Connect Wallet';
      btn.classList.remove('connected');
    }
  });

  // Network badge
  document.querySelectorAll('[data-network-name]').forEach(el => {
    const net = window.NETWORKS[W3.chainId];
    if (W3.isConnected && net) {
      el.textContent = net.shortName || net.name;
      el.style.color = net.isTestnet ? '#fbbf24' : 'var(--teal)';
    } else {
      el.textContent = W3.isConnected ? `Chain ${W3.chainId}` : '';
    }
  });

  // Network indicator
  document.querySelectorAll('[data-network-indicator]').forEach(el => {
    const net = window.NETWORKS[W3.chainId];
    if (W3.isConnected && net) {
      el.classList.remove('hidden');
      el.innerHTML = `
        <span class="network-dot ${net.isTestnet ? 'testnet' : 'mainnet'}"></span>
        <span>${net.shortName}</span>
      `;
    } else {
      el.classList.add('hidden');
    }
  });

  // Balance (if needed)
  document.querySelectorAll('[data-wallet-balance]').forEach(async el => {
    if (W3.isConnected && W3.provider) {
      try {
        const balance = await W3.provider.getBalance(W3.address);
        el.textContent = utils.formatEth(balance) + ' MNT';
      } catch {
        el.textContent = '-- MNT';
      }
    } else {
      el.textContent = '';
    }
  });
}

// ══════════════════════════════════════════════════════════════
// Auto-reconnect
// ══════════════════════════════════════════════════════════════
async function tryAutoConnect() {
  const detected = detectWalletProvider();
  if (!detected) return;

  try {
    const accounts = await detected.provider.request({ method: 'eth_accounts' });
    if (accounts && accounts.length > 0) {
      await _initWeb3(accounts[0], detected.provider);
      W3.walletType = detected.type;
    }
  } catch (e) {
    console.log('Auto-connect failed:', e);
  }
}

// ══════════════════════════════════════════════════════════════
// Event Listeners
// ══════════════════════════════════════════════════════════════
if (window.ethereum) {
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (!accounts || accounts.length === 0) {
      disconnectWallet();
    } else {
      await _initWeb3(accounts[0]);
      toast.info(`Switched to ${utils.shortAddr(accounts[0])}`);
    }
  });

  window.ethereum.on('chainChanged', (chainId) => {
    const newChainId = parseInt(chainId, 16);
    const net = window.NETWORKS[newChainId];

    if (net) {
      toast.info(`Switched to ${net.name}`);
    } else {
      toast.warning('Unsupported network. Please switch to Mantle.');
    }

    // Reload to reinitialize contracts
    setTimeout(() => window.location.reload(), 1000);
  });

  window.ethereum.on('disconnect', () => {
    disconnectWallet();
  });
}

// ══════════════════════════════════════════════════════════════
// DOM Ready
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Bind connect buttons
  document.querySelectorAll('[data-connect-btn]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (W3.isConnected) {
        // Show wallet menu or copy address
        showWalletMenu(btn);
      } else {
        await connectWallet();
      }
    });
  });

  // Mobile menu
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.navbar-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
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

// ══════════════════════════════════════════════════════════════
// Wallet Menu
// ══════════════════════════════════════════════════════════════
function showWalletMenu(anchorEl) {
  // Remove existing menu
  const existing = document.querySelector('.wallet-menu');
  if (existing) {
    existing.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.className = 'wallet-menu';
  menu.innerHTML = `
    <div class="wallet-menu-header">
      <div class="wallet-menu-address" title="${W3.address}">${utils.shortAddr(W3.address)}</div>
      <div class="wallet-menu-network">${window.NETWORKS[W3.chainId]?.name || 'Unknown'}</div>
    </div>
    <div class="wallet-menu-actions">
      <button class="wallet-menu-btn" data-action="copy">
        <span>📋</span> Copy Address
      </button>
      <button class="wallet-menu-btn" data-action="explorer">
        <span>🔗</span> View on Explorer
      </button>
      <button class="wallet-menu-btn" data-action="switch">
        <span>🔄</span> Switch Network
      </button>
      <button class="wallet-menu-btn danger" data-action="disconnect">
        <span>🚪</span> Disconnect
      </button>
    </div>
  `;

  document.body.appendChild(menu);

  // Position
  const rect = anchorEl.getBoundingClientRect();
  menu.style.top = (rect.bottom + 8) + 'px';
  menu.style.right = (window.innerWidth - rect.right) + 'px';

  // Actions
  menu.addEventListener('click', async (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    switch (action) {
      case 'copy':
        utils.copy(W3.address);
        break;
      case 'explorer':
        window.open(utils.explorerAddress(W3.address), '_blank');
        break;
      case 'switch':
        showNetworkSwitcher();
        break;
      case 'disconnect':
        disconnectWallet();
        break;
    }
    menu.remove();
  });

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && !anchorEl.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 10);
}

function showNetworkSwitcher() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal network-modal">
      <div class="modal-header">
        <h3>Switch Network</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="network-list">
          ${Object.entries(window.NETWORKS).map(([id, net]) => `
            <button class="network-option ${W3.chainId == id ? 'active' : ''}" data-chain-id="${id}">
              <span class="network-dot ${net.isTestnet ? 'testnet' : 'mainnet'}"></span>
              <span class="network-name">${net.name}</span>
              ${W3.chainId == id ? '<span class="network-check">✓</span>' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelectorAll('.network-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      const chainId = parseInt(btn.dataset.chainId);
      if (chainId !== W3.chainId) {
        await switchToMantleNetwork(chainId);
      }
      modal.remove();
    });
  });
}

// ══════════════════════════════════════════════════════════════
// Modal Helper
// ══════════════════════════════════════════════════════════════
window.openModal = function(id) {
  document.getElementById(id)?.classList.remove('hidden');
};
window.closeModal = function(id) {
  document.getElementById(id)?.classList.add('hidden');
};

// ══════════════════════════════════════════════════════════════
// Smart Contract Helpers
// ══════════════════════════════════════════════════════════════
async function loadCampaigns() {
  if (W3.fundContract) {
    try {
      const campaigns = await W3.fundContract.getAllCampaigns();
      return campaigns.map(c => ({
        id: Number(c.id),
        creator: c.creator,
        title: c.title,
        description: c.description,
        category: c.category,
        imageUrl: c.imageUrl,
        ipfsHash: c.ipfsHash,
        goal: c.goal.toString(),
        raised: c.raised.toString(),
        deadline: Number(c.deadline),
        withdrawn: c.withdrawn,
        active: c.active,
        donorCount: Number(c.donorCount),
        voteCount: Number(c.voteCount),
        againstCount: Number(c.againstCount),
        createdAt: Number(c.createdAt),
        status: Number(c.status)
      }));
    } catch (e) {
      console.error('Contract read failed:', e);
    }
  }
  return window.DEMO_CAMPAIGNS;
}

async function loadCampaign(id) {
  if (W3.fundContract) {
    try {
      const c = await W3.fundContract.getCampaign(id);
      return {
        id: Number(c.id),
        creator: c.creator,
        title: c.title,
        description: c.description,
        category: c.category,
        imageUrl: c.imageUrl,
        ipfsHash: c.ipfsHash,
        goal: c.goal.toString(),
        raised: c.raised.toString(),
        deadline: Number(c.deadline),
        withdrawn: c.withdrawn,
        active: c.active,
        donorCount: Number(c.donorCount),
        voteCount: Number(c.voteCount),
        againstCount: Number(c.againstCount),
        createdAt: Number(c.createdAt),
        status: Number(c.status)
      };
    } catch (e) {
      console.error('Failed to load campaign:', e);
    }
  }
  return window.DEMO_CAMPAIGNS.find(c => c.id == id) || null;
}

async function loadStats() {
  if (W3.fundContract) {
    try {
      const [campaigns, raised, donors] = await W3.fundContract.getStats();
      return {
        campaigns: campaigns.toString(),
        raised: raised.toString(),
        donors: donors.toString()
      };
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  }
  return {
    campaigns: window.DEMO_CAMPAIGNS.length.toString(),
    raised: window.DEMO_CAMPAIGNS.reduce((a, c) => a + BigInt(c.raised), 0n).toString(),
    donors: '2041'
  };
}

function animateCounter(el, target, isEth = false) {
  if (!el) return;
  const duration = 2000;
  const start = performance.now();
  const startVal = 0;

  function update(time) {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startVal + (target - startVal) * eased;

    if (isEth) {
      el.textContent = current.toFixed(1) + ' MNT';
    } else {
      el.textContent = utils.formatNum(Math.floor(current));
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ══════════════════════════════════════════════════════════════
// Exports
// ══════════════════════════════════════════════════════════════
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.switchToMantleNetwork = switchToMantleNetwork;
window.loadCampaigns = loadCampaigns;
window.loadCampaign = loadCampaign;
window.loadStats = loadStats;
window.animateCounter = animateCounter;
