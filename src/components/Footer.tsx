import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="navbar-brand" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
              <div className="brand-icon">🔗</div>
              <span className="brand-text">TrustChain</span>
            </Link>
            <p className="footer-desc">
              TrustChain is a decentralized, transparent crowdfunding and charity platform built on Mantle Sepolia Testnet. All contributions are verifiable on-chain with automatic NFT receipts.
            </p>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              <li><Link href="/campaigns">Explore Campaigns</Link></li>
              <li><Link href="/create-campaign">Start a Campaign</Link></li>
              <li><Link href="/dashboard">My Dashboard</Link></li>
              <li><Link href="/leaderboard">Leaderboard</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Network</h4>
            <ul className="footer-links">
              <li><a href="https://sepolia.mantlescan.xyz" target="_blank" rel="noopener noreferrer">Mantle Sepolia Explorer ↗</a></li>
              <li><a href="https://faucet.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer">Mantle Testnet Faucet ↗</a></li>
              <li><a href="https://docs.mantle.xyz" target="_blank" rel="noopener noreferrer">Mantle Documentation ↗</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 TrustChain — Decentralized Charity Platform on Mantle Sepolia Testnet</span>
          <span style={{ color: 'var(--text-secondary)' }}>Built with Next.js, Wagmi & Viem</span>
        </div>
      </div>
    </footer>
  );
}
