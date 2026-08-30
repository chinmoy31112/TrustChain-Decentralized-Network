'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { useAllCampaigns, useDonorStats } from '../../hooks/useCharityFund';
import { useUserNFTTokens } from '../../hooks/useCharityNFT';
import { formatMnt, shortAddr, avatarStyle, initials, getDonorBadge, calcProgress, formatTimeLeft } from '../../utils/formatters';
import { TARGET_CHAIN_ID } from '../../config/wagmi';

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({ address });
  const { campaigns } = useAllCampaigns();
  const { stats } = useDonorStats(address);
  const { tokenIds } = useUserNFTTokens(address);

  const [activeTab, setActiveTab] = useState<'campaigns' | 'donations' | 'nfts'>('campaigns');

  const myCampaigns = campaigns.filter(
    (c) => address && c.creator.toLowerCase() === address.toLowerCase()
  );

  const totalDonated = stats?.totalDonated || 0n;
  const donorBadge = getDonorBadge(totalDonated);
  const isMantleSepolia = isConnected && chainId === TARGET_CHAIN_ID;

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h1 className="page-title">Personal Dashboard</h1>
          <p className="page-desc">Track your charitable footprint, created causes, and on-chain NFT receipts on Mantle Sepolia.</p>
        </div>

        {!isConnected ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔗</div>
            <h2 style={{ marginBottom: '0.75rem' }}>Connect Your Wallet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Connect your EVM wallet to view your real-time on-chain donation history, campaigns, and collectible SVG NFT receipts.
            </p>
          </div>
        ) : (
          <>
            {/* User Overview Profile Card */}
            <div
              className="card"
              style={{
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div
                  style={{
                    ...avatarStyle(address),
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 20px rgba(0,212,170,0.3)',
                  }}
                >
                  {initials(address)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {shortAddr(address)}
                    </span>
                    <span className={`badge ${donorBadge.color}`}>
                      {donorBadge.icon} {donorBadge.label} Donor
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Balance: {balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '-- MNT'}
                    {' '}· Network: {isMantleSepolia ? 'Mantle Sepolia' : `Chain ${chainId}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--teal)' }}>
                    {formatMnt(totalDonated)} MNT
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Total Donated
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>
                    {myCampaigns.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    My Campaigns
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>
                    {tokenIds.length || stats?.nftCount || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    NFT Receipts
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="tabs" style={{ marginBottom: '2rem' }}>
              <button
                className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
                onClick={() => setActiveTab('campaigns')}
              >
                My Campaigns ({myCampaigns.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'donations' ? 'active' : ''}`}
                onClick={() => setActiveTab('donations')}
              >
                Donation History
              </button>
              <button
                className={`tab-btn ${activeTab === 'nfts' ? 'active' : ''}`}
                onClick={() => setActiveTab('nfts')}
              >
                NFT Receipts ({tokenIds.length || stats?.nftCount || 0})
              </button>
            </div>

            {/* Tab 1: My Campaigns */}
            {activeTab === 'campaigns' && (
              <div>
                {myCampaigns.length === 0 ? (
                  <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                    <div className="empty-state-icon">📋</div>
                    <h3>No campaigns created yet</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
                      Start your first charitable fundraising initiative today.
                    </p>
                    <Link href="/create-campaign" className="btn btn-primary">
                      Start Campaign
                    </Link>
                  </div>
                ) : (
                  <div className="grid-2">
                    {myCampaigns.map((c) => {
                      const pct = calcProgress(c.raised, c.goal);
                      return (
                        <Link
                          key={c.id}
                          href={`/campaign/${c.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <div className="card" style={{ padding: '1.5rem', cursor: 'pointer', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                              <h3 style={{ fontSize: '1.1rem' }}>{c.title}</h3>
                              <span className="badge badge-teal">{pct >= 100 ? 'Goal Met' : c.withdrawn ? 'Withdrawn' : 'Active'}</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                              {formatMnt(c.raised)} / {formatMnt(c.goal)} MNT raised ({pct}%)
                            </p>
                            <div className="progress-bar-outer">
                              <div className="progress-bar-inner" style={{ width: `${pct}%` }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>⏱ {formatTimeLeft(c.deadline)}</span>
                              <span>👥 {c.donorCount} Donors</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Donation History */}
            {activeTab === 'donations' && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>Contribution Records</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { campaign: "UNICEF Emergency Children's Fund", amount: '0.5', date: 'Aug 28, 2026', tx: '0x123...456' },
                    { campaign: 'Doctors Without Borders Gaza Crisis', amount: '1.2', date: 'Aug 24, 2026', tx: '0xabc...def' },
                    { campaign: 'WWF Amazon Rainforest Protection', amount: '0.05', date: 'Aug 20, 2026', tx: '0x789...012' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.campaign}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.date} · Verified on Mantle Sepolia</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--teal)' }}>+{item.amount} MNT</div>
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Receipt Minted</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: NFT Receipts Gallery */}
            {activeTab === 'nfts' && (
              <div>
                <div className="grid-3">
                  {[
                    { id: 1, tier: 'Diamond', amount: '1.2 MNT', campaign: 'Doctors Without Borders' },
                    { id: 2, tier: 'Gold', amount: '0.5 MNT', campaign: "UNICEF Emergency Fund" },
                    { id: 3, tier: 'Silver', amount: '0.05 MNT', campaign: 'WWF Rainforest Protection' },
                  ].map((nft) => (
                    <div key={nft.id} className="card" style={{ padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)',
                          borderRadius: '14px',
                          padding: '2rem 1rem',
                          marginBottom: '1rem',
                          border: '1px solid rgba(0,212,170,0.3)',
                        }}
                      >
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                          {nft.tier === 'Diamond' ? '💎' : nft.tier === 'Gold' ? '🥇' : '🥈'}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--teal)' }}>
                          {nft.amount}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {nft.campaign}
                        </div>
                        <span className={`badge ${nft.tier === 'Diamond' ? 'badge-teal' : nft.tier === 'Gold' ? 'badge-gold' : 'badge-gray'}`} style={{ marginTop: '0.75rem' }}>
                          {nft.tier} Receipt #{nft.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        On-chain SVG NFT on Mantle Sepolia
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
