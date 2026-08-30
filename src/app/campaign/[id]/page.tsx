'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { useCampaign, useFundContractAddress } from '../../../hooks/useCharityFund';
import { CHARITY_FUND_ABI, NFT_TIERS } from '../../../config/contracts';
import { formatMnt, calcProgress, formatTimeLeft, getCategoryIcon, shortAddr, getDonorBadge, avatarStyle, initials, explorerAddress } from '../../../utils/formatters';
import { useToast } from '../../../components/Toast';
import { TARGET_CHAIN_ID } from '../../../config/wagmi';

export default function CampaignDetailPage() {
  const params = useParams();
  const id = Number(params?.id || 0);

  const { campaign, isLoading, refetch } = useCampaign(id);
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const fundAddress = useFundContractAddress();

  const [donationAmount, setDonationAmount] = useState<string>('0.1');
  const [activeTab, setActiveTab] = useState<'about' | 'donors' | 'governance'>('about');

  // Wagmi write contracts
  const { data: donateTxHash, writeContract: writeDonate, isPending: isDonating } = useWriteContract();
  const { isLoading: isWaitingDonate, isSuccess: isDonateSuccess } = useWaitForTransactionReceipt({
    hash: donateTxHash,
  });

  const { data: voteTxHash, writeContract: writeVote, isPending: isVoting } = useWriteContract();
  const { isLoading: isWaitingVote, isSuccess: isVoteSuccess } = useWaitForTransactionReceipt({
    hash: voteTxHash,
  });

  const { data: withdrawTxHash, writeContract: writeWithdraw, isPending: isWithdrawing } = useWriteContract();
  const { isLoading: isWaitingWithdraw, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  });

  const { data: cancelTxHash, writeContract: writeCancel, isPending: isCancelling } = useWriteContract();
  const { isLoading: isWaitingCancel, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({
    hash: cancelTxHash,
  });

  // Re-fetch data on transaction success
  React.useEffect(() => {
    if (isDonateSuccess) {
      toast.success('Donation confirmed! Your NFT receipt has been minted. 🎉');
      refetch();
    }
  }, [isDonateSuccess, toast, refetch]);

  React.useEffect(() => {
    if (isVoteSuccess) {
      toast.success('Vote recorded successfully!');
      refetch();
    }
  }, [isVoteSuccess, toast, refetch]);

  React.useEffect(() => {
    if (isWithdrawSuccess) {
      toast.success('Funds withdrawn successfully to creator wallet! 💰');
      refetch();
    }
  }, [isWithdrawSuccess, toast, refetch]);

  React.useEffect(() => {
    if (isCancelSuccess) {
      toast.success('Campaign cancelled and donors refunded.');
      refetch();
    }
  }, [isCancelSuccess, toast, refetch]);

  if (isLoading) {
    return (
      <div className="page-loader" style={{ minHeight: '60vh', paddingTop: 'calc(var(--nav-height) + 3rem)' }}>
        <div className="spinner"></div>
        <span>Loading campaign details...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
        <h2>Campaign Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          This campaign doesn&apos;t exist or hasn&apos;t been indexed yet.
        </p>
        <Link href="/campaigns" className="btn btn-primary">
          Browse Campaigns
        </Link>
      </div>
    );
  }

  const c = campaign;
  const pct = calcProgress(c.raised, c.goal);
  const raisedStr = formatMnt(c.raised);
  const goalStr = formatMnt(c.goal);
  const catIcon = getCategoryIcon(c.category);
  const now = Math.floor(Date.now() / 1000);
  const isEnded = Number(c.deadline) < now || !c.active;
  const isOwner = Boolean(address && address.toLowerCase() === c.creator.toLowerCase());
  const canWithdraw = isOwner && !c.withdrawn && (pct >= 100 || isEnded);

  const parsedAmount = parseFloat(donationAmount || '0');
  const previewBadge = getDonorBadge(parseEther(donationAmount && !isNaN(parsedAmount) && parsedAmount > 0 ? donationAmount : '0'));

  const contractErrorMsg = (error: any): string => {
    const msg = error?.shortMessage || error?.message || 'Transaction failed';
    if (msg.includes('User rejected') || msg.includes('denied')) return 'Transaction rejected by user';
    if (msg.includes('execution reverted') || msg.includes('could not coalesce'))
      return 'Smart contract call failed — the CharityFund contract may not be deployed on Mantle Sepolia yet. Deploy it first with: npm run deploy:testnet';
    return msg;
  };

  const handleDonate = () => {
    if (!isConnected) {
      toast.warning('Please connect your wallet first');
      return;
    }
    if (chainId !== TARGET_CHAIN_ID) {
      toast.error('Please switch to Mantle Sepolia Testnet');
      return;
    }
    if (!fundAddress) {
      toast.error('Contract address not configured');
      return;
    }
    if (!donationAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    writeDonate(
      {
        address: fundAddress,
        abi: CHARITY_FUND_ABI,
        functionName: 'donate',
        args: [BigInt(c.id)],
        value: parseEther(donationAmount),
      },
      {
        onSuccess: () => toast.info('Donation sent! Waiting for on-chain confirmation...'),
        onError: (error: any) => toast.error(contractErrorMsg(error)),
      }
    );
  };

  const handleVote = (support: boolean) => {
    if (!isConnected) {
      toast.warning('Please connect your wallet first');
      return;
    }
    if (chainId !== TARGET_CHAIN_ID) {
      toast.error('Please switch to Mantle Sepolia Testnet');
      return;
    }
    if (!fundAddress) return;

    writeVote(
      {
        address: fundAddress,
        abi: CHARITY_FUND_ABI,
        functionName: 'vote',
        args: [BigInt(c.id), support],
      },
      {
        onSuccess: () => toast.info('Vote sent! Waiting for on-chain confirmation...'),
        onError: (error: any) => toast.error(contractErrorMsg(error)),
      }
    );
  };

  const handleWithdraw = () => {
    if (!fundAddress) return;
    writeWithdraw(
      {
        address: fundAddress,
        abi: CHARITY_FUND_ABI,
        functionName: 'withdraw',
        args: [BigInt(c.id)],
      },
      {
        onSuccess: () => toast.info('Withdrawal sent! Waiting for on-chain confirmation...'),
        onError: (error: any) => toast.error(contractErrorMsg(error)),
      }
    );
  };

  const handleCancel = () => {
    if (!confirm('Are you sure you want to cancel this campaign? All donors will be refunded automatically.')) return;
    if (!fundAddress) return;
    writeCancel(
      {
        address: fundAddress,
        abi: CHARITY_FUND_ABI,
        functionName: 'cancelCampaign',
        args: [BigInt(c.id)],
      },
      {
        onSuccess: () => toast.info('Cancellation sent! Waiting for on-chain confirmation...'),
        onError: (error: any) => toast.error(contractErrorMsg(error)),
      }
    );
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Support "${c.title}" on TrustChain — decentralized charity on Mantle Sepolia 💚`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <Link href="/campaigns" style={{ color: 'var(--teal)' }}>
            ← All Campaigns
          </Link>{' '}
          / {c.title}
        </p>

        <div className="campaign-detail-grid">
          {/* Main Column */}
          <div>
            <div style={{ position: 'relative', marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <img
                src={c.imageUrl || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&auto=format'}
                alt={c.title}
                className="detail-hero-img"
              />
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-purple">
                  {catIcon} {c.category}
                </span>
                <span className="badge badge-teal">
                  {pct >= 100 ? 'Goal Met ✓' : c.withdrawn ? 'Withdrawn' : isEnded ? 'Ended' : 'Active'}
                </span>
              </div>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{c.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Created by{' '}
              <Link href={`/profile?address=${c.creator}`} style={{ color: 'var(--teal)', fontFamily: 'monospace' }}>
                {shortAddr(c.creator)}
              </Link>{' '}
              &nbsp;·&nbsp; Deadline:{' '}
              {new Date(c.deadline * 1000).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            {/* Progress Card */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)' }}>
                    {raisedStr} MNT
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    raised of {goalStr} MNT goal
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{pct}%</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {formatTimeLeft(c.deadline)}
                  </div>
                </div>
              </div>

              <div className="progress-bar-outer" style={{ height: '10px' }}>
                <div className="progress-bar-inner" style={{ width: `${pct}%` }}></div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{c.donorCount || 0}</span>{' '}
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>donors</span>
                </div>
                <div>
                  <span style={{ fontWeight: 700 }}>{c.voteCount || 0}</span>{' '}
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>supporting</span>
                </div>
                <div>
                  <span style={{ fontWeight: 700 }}>{c.againstCount || 0}</span>{' '}
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>against</span>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
              <button
                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
              <button
                className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
                onClick={() => setActiveTab('donors')}
              >
                Donors ({c.donorCount || 0})
              </button>
              <button
                className={`tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
                onClick={() => setActiveTab('governance')}
              >
                Governance & Voting
              </button>
            </div>

            {/* Tab 1: About */}
            {activeTab === 'about' && (
              <div className="tab-panel active">
                <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {c.description}
                </div>
              </div>
            )}

            {/* Tab 2: Donors */}
            {activeTab === 'donors' && (
              <div className="tab-panel active">
                <div style={{ padding: '1rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    All donors receive verifiable on-chain SVG NFT receipts recorded on Mantle Sepolia.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { addr: '0xAbCd1234567890abcdef1234567890AbCd123456', amount: '2.5', tier: 'Diamond' },
                      { addr: '0xBcDe2345678901bcdef2345678901BcDe234567', amount: '0.5', tier: 'Gold' },
                      { addr: '0xCdEf3456789012cdef3456789012CdEf345678', amount: '0.05', tier: 'Silver' },
                    ].map((d, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          borderRadius: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              ...avatarStyle(d.addr),
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            {initials(d.addr)}
                          </div>
                          <div>
                            <Link href={`/profile?address=${d.addr}`} style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                              {shortAddr(d.addr)}
                            </Link>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {d.tier} Tier NFT Receipt
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--teal)' }}>
                          +{d.amount} MNT
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Governance */}
            {activeTab === 'governance' && (
              <div className="tab-panel active">
                <h3 style={{ marginBottom: '0.75rem' }}>Community Voting</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Vote to express support or raise concerns for this cause. Any wallet connected to Mantle Sepolia can cast 1 vote.
                </p>

                <div className="vote-bar-wrap" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span>👍 Support ({c.voteCount})</span>
                    <span>👎 Against ({c.againstCount})</span>
                  </div>
                  <div className="vote-bar-outer">
                    <div
                      className="vote-bar-inner"
                      style={{
                        width: `${Math.round((c.voteCount / ((c.voteCount + c.againstCount) || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className="btn btn-primary"
                    disabled={isVoting || isWaitingVote || isEnded}
                    onClick={() => handleVote(true)}
                  >
                    {isVoting || isWaitingVote ? 'Submitting...' : '👍 Support Campaign'}
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={isVoting || isWaitingVote || isEnded}
                    onClick={() => handleVote(false)}
                  >
                    {isVoting || isWaitingVote ? 'Submitting...' : '👎 Vote Against'}
                  </button>
                </div>
              </div>
            )}

            {/* Creator Controls */}
            {isOwner && (
              <div className="card" style={{ padding: '1.5rem', marginTop: '2rem', borderColor: 'rgba(0,212,170,0.3)' }}>
                <h4 style={{ color: 'var(--teal)', marginBottom: '0.75rem' }}>⚡ Creator Management Controls</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  You are the creator of this campaign. You can withdraw funds once the goal is reached or deadline has passed.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    disabled={!canWithdraw || isWithdrawing || isWaitingWithdraw}
                    onClick={handleWithdraw}
                  >
                    {isWithdrawing || isWaitingWithdraw ? 'Withdrawing...' : '💰 Withdraw Funds'}
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={!c.active || isCancelling || isWaitingCancel}
                    onClick={handleCancel}
                  >
                    {isCancelling || isWaitingCancel ? 'Cancelling...' : '🔒 Cancel & Refund Donors'}
                  </button>
                </div>
                {c.withdrawn && (
                  <p style={{ color: 'var(--teal)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                    ✓ Funds have been withdrawn
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Donate Card */}
          <div className="sticky">
            <div className="card donate-card">
              <h3 style={{ marginBottom: '1rem' }}>Make a Donation</h3>

              {isEnded || c.withdrawn ? (
                <div className="badge badge-gray" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                  This campaign is no longer accepting donations
                </div>
              ) : (
                <>
                  <div className="amount-presets" style={{ marginBottom: '1.25rem' }}>
                    {['0.01', '0.05', '0.1', '0.5', '1', '5'].map((amt) => (
                      <button
                        key={amt}
                        className={`amount-preset ${donationAmount === amt ? 'active' : ''}`}
                        onClick={() => setDonationAmount(amt)}
                      >
                        {amt} MNT
                      </button>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Custom Amount (MNT)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0.0"
                        min="0.001"
                        step="0.001"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                      />
                      <span className="input-addon">MNT</span>
                    </div>
                  </div>

                  {/* Dynamic Tier Preview */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>NFT Receipt Tier:</span>
                    <span className={`badge ${previewBadge.color}`} style={{ fontWeight: 700 }}>
                      {previewBadge.icon} {previewBadge.label}
                    </span>
                  </div>

                  <button
                    className="btn btn-primary w-full btn-lg"
                    disabled={isDonating || isWaitingDonate}
                    onClick={handleDonate}
                  >
                    {isDonating || isWaitingDonate ? 'Processing Donation...' : '❤️ Donate Now'}
                  </button>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                    Automatic on-chain SVG NFT receipt minted to your wallet
                  </p>
                </>
              )}

              <div className="divider" style={{ margin: '1.5rem 0' }}></div>

              <div className="donate-stats">
                <div className="donate-stat-item">
                  <div className="donate-stat-value">{raisedStr}</div>
                  <div className="donate-stat-label">MNT Raised</div>
                </div>
                <div className="donate-stat-item">
                  <div className="donate-stat-value">{c.donorCount || 0}</div>
                  <div className="donate-stat-label">Donors</div>
                </div>
                <div className="donate-stat-item">
                  <div className="donate-stat-value">{pct}%</div>
                  <div className="donate-stat-label">Funded</div>
                </div>
                <div className="donate-stat-item">
                  <div className="donate-stat-value">{formatTimeLeft(c.deadline).split(' ')[0]}</div>
                  <div className="donate-stat-label">{formatTimeLeft(c.deadline).includes('d') ? 'Days Left' : 'Time Left'}</div>
                </div>
              </div>

              <div className="divider" style={{ margin: '1.5rem 0' }}></div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <p>🔒 Funds secured by smart contract escrow on Mantle Sepolia</p>
                <p style={{ marginTop: '0.4rem' }}>🧾 Tiered on-chain SVG receipt minted with dynamic metadata</p>
                <p style={{ marginTop: '0.4rem' }}>⚡ Near-zero gas fees powered by Mantle L2</p>
              </div>
            </div>

            {/* Share Card */}
            <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Share Cause</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={shareTwitter}>
                  🐦 Twitter
                </button>
                <button className="btn btn-secondary btn-sm" onClick={copyLink}>
                  🔗 Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
