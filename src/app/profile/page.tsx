'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useDonorStats, useAllCampaigns } from '../../hooks/useCharityFund';
import { useUserNFTTokens } from '../../hooks/useCharityNFT';
import { formatMnt, shortAddr, avatarStyle, initials, getDonorBadge, explorerAddress, calcProgress, formatTimeLeft, getCampaignStatusBadge } from '../../utils/formatters';
import { useToast } from '../../components/Toast';
import { NFTReceiptCard } from '../../components/NFTReceiptCard';

function ProfileContent() {
  const searchParams = useSearchParams();
  const addressParam = searchParams.get('address') as `0x${string}` | null;
  const { address: connectedAddress } = useAccount();
  const { toast } = useToast();

  const profileAddress = addressParam || connectedAddress;

  const { stats, isLoading } = useDonorStats(profileAddress || undefined);
  const { campaigns } = useAllCampaigns();
  const { tokenIds } = useUserNFTTokens(profileAddress || undefined);

  const [activeTab, setActiveTab] = useState<'campaigns' | 'nfts'>('campaigns');

  const copyAddress = () => {
    if (profileAddress) {
      navigator.clipboard.writeText(profileAddress);
      toast.success('Address copied to clipboard!');
    }
  };

  if (!profileAddress) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
        <h2>No Profile Specified</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          Connect your wallet or provide an address query parameter to inspect profile activity.
        </p>
        <Link href="/leaderboard" className="btn btn-primary">
          View Leaderboard
        </Link>
      </div>
    );
  }

  const isOwnProfile = Boolean(connectedAddress && profileAddress.toLowerCase() === connectedAddress.toLowerCase());
  const createdCampaigns = campaigns.filter(
    (c) => c.creator.toLowerCase() === profileAddress.toLowerCase()
  );

  const totalDonated = stats?.totalDonated || 0n;
  const badge = getDonorBadge(totalDonated);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Profile Header */}
        <div
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div
              style={{
                ...avatarStyle(profileAddress),
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                boxShadow: '0 0 24px rgba(0,212,170,0.3)',
              }}
            >
              {initials(profileAddress)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, wordBreak: 'break-all' }}>
                  {profileAddress}
                </span>
                <button
                  onClick={copyAddress}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                  title="Copy address"
                >
                  📋
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={`badge ${badge.color}`}>
                  {badge.icon} {badge.label} Donor
                </span>
                {isOwnProfile && <span className="badge badge-teal">Your Profile</span>}
              </div>
            </div>
          </div>

          <a
            href={explorerAddress(profileAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            View on Explorer ↗
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--teal)' }}>
              {formatMnt(totalDonated)} MNT
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Total Donated
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>
              {stats?.donationCount || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Causes Supported
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>
              {tokenIds.length || stats?.nftCount || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              NFT Receipts
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>
              {createdCampaigns.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Campaigns Created
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="tabs" style={{ marginBottom: '2rem', maxWidth: '400px' }}>
          <button
            className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns ({createdCampaigns.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'nfts' ? 'active' : ''}`}
            onClick={() => setActiveTab('nfts')}
          >
            NFT Receipts ({tokenIds.length || stats?.nftCount || 0})
          </button>
        </div>

        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <div>
            {createdCampaigns.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <div className="empty-state-icon">📋</div>
                <h3>No campaigns created yet</h3>
                <p style={{ color: 'var(--text-secondary)' }}>This user has not launched any fundraising causes.</p>
              </div>
            ) : (
              <div className="grid-2">
                {createdCampaigns.map((c) => {
                  const pct = calcProgress(c.raised, c.goal);
                  return (
                    <Link key={c.id} href={`/campaign/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h3>{c.title}</h3>
                          {(() => {
                            const statusBadge = getCampaignStatusBadge(c);
                            return <span className={`badge ${statusBadge.badgeCls}`}>{statusBadge.label}</span>;
                          })()}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          {formatMnt(c.raised)} / {formatMnt(c.goal)} MNT ({pct}%)
                        </p>
                        <div className="progress-bar-outer">
                          <div className="progress-bar-inner" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: NFTs */}
        {activeTab === 'nfts' && (
          <div>
            {tokenIds.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <div className="empty-state-icon">🎨</div>
                <h3>No NFT receipts</h3>
                <p style={{ color: 'var(--text-secondary)' }}>This user has not received any on-chain NFT donation receipts yet.</p>
              </div>
            ) : (
              <div className="grid-3">
                {tokenIds.map((tokenId) => (
                  <NFTReceiptCard key={tokenId} tokenId={tokenId} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="page-loader"><div className="spinner"></div></div>}>
      <ProfileContent />
    </Suspense>
  );
}
