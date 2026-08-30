'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useChainId } from 'wagmi';
import { shortAddr, avatarStyle, initials } from '../utils/formatters';
import { WalletModal } from './WalletModal';
import { TARGET_CHAIN_ID } from '../config/wagmi';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isMantleSepolia = isConnected && chainId === TARGET_CHAIN_ID;

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <div className="brand-icon">🔗</div>
          <span className="brand-text">TrustChain</span>
        </Link>

        <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/campaigns"
            className={`nav-link ${pathname.startsWith('/campaign') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Campaigns
          </Link>
          <Link
            href="/create-campaign"
            className={`nav-link ${pathname === '/create-campaign' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Start Campaign
          </Link>
          <Link
            href="/dashboard"
            className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/leaderboard"
            className={`nav-link ${pathname === '/leaderboard' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Leaderboard
          </Link>
        </div>

        <div className="navbar-right">
          {isConnected && (
            <div
              data-network-indicator
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '0.8rem',
                border: '1px solid var(--border)',
              }}
            >
              <span
                className={`network-dot ${isMantleSepolia ? 'testnet' : 'disconnected'}`}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isMantleSepolia ? '#fbbf24' : '#ff4757',
                  boxShadow: isMantleSepolia ? '0 0 8px #fbbf24' : '0 0 8px #ff4757',
                }}
              />
              <span>{isMantleSepolia ? 'Mantle Sepolia' : `Chain ${chainId}`}</span>
            </div>
          )}

          <button
            className={`btn btn-primary btn-sm ${isConnected ? 'connected' : ''}`}
            onClick={() => setIsWalletModalOpen(true)}
            data-connect-btn
          >
            {isConnected && address ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="nav-avatar"
                  style={{
                    ...avatarStyle(address),
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {initials(address)}
                </span>
                <span className="nav-addr">{shortAddr(address)}</span>
                <span
                  className="nav-online-dot"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00d4aa',
                  }}
                />
              </span>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>

        <button
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          aria-label="Menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
}
