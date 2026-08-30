'use client';

import React from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { shortAddr } from '../utils/formatters';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connect, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isOpen) return null;

  const getConnectorMeta = (id: string, name: string) => {
    const lower = (id + name).toLowerCase();
    if (lower.includes('meta')) {
      return {
        icon: '🦊',
        name: 'MetaMask',
        badge: 'Popular',
        color: '#E27625',
      };
    }
    if (lower.includes('phantom')) {
      return {
        icon: '👻',
        name: 'Phantom (EVM)',
        badge: 'Detected',
        color: '#AB9FF2',
      };
    }
    if (lower.includes('coinbase')) {
      return {
        icon: '🔵',
        name: 'Coinbase Wallet',
        badge: 'Secure',
        color: '#0052FF',
      };
    }
    return {
      icon: '🌐',
      name: name || 'Browser Wallet',
      badge: 'EIP-1193',
      color: '#00D4AA',
    };
  };

  return (
    <div className="wc-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="wc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wc-header">
          <div>
            <h3 className="wc-title">{isConnected ? 'Wallet Connected' : 'Connect Wallet'}</h3>
            <p className="wc-subtitle">
              {isConnected
                ? `Connected as ${shortAddr(address)}`
                : 'Choose your preferred wallet to connect to Mantle Sepolia'}
            </p>
          </div>
          <button className="wc-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {isConnected ? (
          <div style={{ padding: '1.5rem 0' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Connected Address
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', wordBreak: 'break-all' }}>
                {address}
              </div>
            </div>
            <button
              className="btn btn-danger w-full"
              onClick={() => {
                disconnect();
                onClose();
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="wc-list">
            {connectors
              .filter((connector) => {
                // Exclude Phantom — it doesn't support Mantle Sepolia Testnet
                const id = (connector.id + connector.name).toLowerCase();
                return !id.includes('phantom');
              })
              .map((connector) => {
              const meta = getConnectorMeta(connector.id, connector.name);
              return (
                <button
                  key={connector.uid}
                  className="wc-option"
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector });
                    onClose();
                  }}
                >
                  <span className="wc-icon" style={{ fontSize: '1.5rem' }}>
                    {meta.icon}
                  </span>
                  <span className="wc-name">{meta.name}</span>
                  <span className="wc-badge wc-detected">{meta.badge}</span>
                </button>
              );
            })}
          </div>
        )}

        <p className="wc-footer">
          By connecting, you agree to interact with TrustChain smart contracts on Mantle Sepolia Testnet.
        </p>
      </div>
    </div>
  );
}
