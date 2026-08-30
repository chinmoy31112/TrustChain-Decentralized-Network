'use client';

import React from 'react';
import Link from 'next/link';
import { usePlatformStats, useAllCampaigns } from '../hooks/useCharityFund';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { SafeImage } from '../components/SafeImage';
import { formatMntLabel, formatMnt, calcProgress, formatTimeLeft, getCategoryIcon } from '../utils/formatters';
import { CATEGORIES } from '../config/contracts';

export default function HomePage() {
  const { campaigns: totalCampaigns, raised: totalRaised, donors: totalDonors } = usePlatformStats();
  const { campaigns } = useAllCampaigns();

  const featuredCampaigns = campaigns.slice(0, 3);
  const categoriesList = CATEGORIES.filter((c) => c.value !== 'all');

  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1"></div>
          <div className="hero-orb orb-2"></div>
          <div className="hero-orb orb-3"></div>
          <ParticleCanvas />
        </div>

        <div className="container hero-two-col">
          {/* LEFT: Text content */}
          <div className="hero-content fade-up">
            <div className="hero-eyebrow">
              <span>🔗</span>
              <span>Live on Mantle Sepolia Testnet</span>
            </div>

            <h1 className="hero-title">
              Fund Change,<br />
              <span className="gradient-text">Transparently.</span>
            </h1>

            <p className="hero-desc">
              The world&apos;s most open charity platform built on Mantle L2. Every donation is on-chain, every cent is traceable, every impact is real — with near-zero gas fees.
            </p>

            <div className="hero-actions">
              <Link href="/campaigns" className="btn btn-primary btn-lg">
                🌍 Explore Campaigns
              </Link>
              <Link href="/create-campaign" className="btn btn-secondary btn-lg">
                ✨ Start a Campaign
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--teal)' }}>
                  {formatMntLabel(totalRaised)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  MNT Raised
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                  {totalCampaigns}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  Campaigns
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                  {totalDonors}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  Donors
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Animated floating cards */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-globe"></div>

            {/* Float Card 1 */}
            <div className="hero-float-card card-float-1">
              <div className="hfc-icon">❤️</div>
              <div className="hfc-body">
                <div className="hfc-title">Health for All</div>
                <div className="hfc-raised">+120 MNT</div>
                <div className="hfc-bar"><div className="hfc-bar-fill" style={{ width: '76%' }}></div></div>
              </div>
            </div>

            {/* Float Card 2 */}
            <div className="hero-float-card card-float-2">
              <div className="hfc-icon">🌿</div>
              <div className="hfc-body">
                <div className="hfc-title">Clean Water Project</div>
                <div className="hfc-raised">+450 MNT</div>
                <div className="hfc-bar"><div className="hfc-bar-fill" style={{ width: '92%' }}></div></div>
              </div>
            </div>

            {/* Float Card 3 */}
            <div className="hero-float-card card-float-3">
              <div className="hfc-icon">🎓</div>
              <div className="hfc-body">
                <div className="hfc-title">Books for Every Child</div>
                <div className="hfc-raised">+85 MNT</div>
                <div className="hfc-bar"><div className="hfc-bar-fill" style={{ width: '60%' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURED CAMPAIGNS ══════════════════════ */}
      <section className="section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Causes</h2>
              <p className="section-desc">Support high-impact campaigns verified and funded on Mantle Sepolia.</p>
            </div>
            <Link href="/campaigns" className="btn btn-outline">
              View All Causes →
            </Link>
          </div>

          <div className="grid-3" id="featuredCampaigns">
            {featuredCampaigns.map((c, i) => {
              const pct = calcProgress(c.raised, c.goal);
              const raisedStr = formatMnt(c.raised);
              const goalStr = formatMnt(c.goal);
              const catIcon = getCategoryIcon(c.category);

              return (
                <Link
                  key={c.id}
                  href={`/campaign/${c.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <article className={`card campaign-card fade-up stagger-${i + 1}`} style={{ cursor: 'pointer', height: '100%' }}>
                    <div className="campaign-card-img-wrapper" style={{ position: 'relative' }}>
                      <SafeImage
                        src={c.imageUrl}
                        alt={c.title}
                        className="campaign-card-img"
                        loading="lazy"
                      />
                      <span className="badge badge-purple" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        {catIcon} {c.category}
                      </span>
                    </div>
                    <div className="campaign-card-body">
                      <h3 className="campaign-card-title">{c.title}</h3>
                      <p className="campaign-card-desc">{c.description}</p>
                      <div className="progress-wrap">
                        <div className="progress-info">
                          <span className="progress-raised">{raisedStr} MNT</span>
                          <span className="progress-goal">of {goalStr} MNT</span>
                        </div>
                        <div className="progress-bar-outer">
                          <div className="progress-bar-inner" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                      <div className="campaign-card-meta">
                        <span className="badge badge-teal">{pct >= 100 ? 'Goal Met ✓' : 'Active'}</span>
                        <span>⏱ {formatTimeLeft(c.deadline)}</span>
                        <span>👥 {c.donorCount || 0}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CATEGORIES ══════════════════════ */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-desc">Find causes that resonate with your philanthropic goals.</p>
          </div>

          <div className="grid-4" id="categoriesGrid">
            {categoriesList.map((cat) => (
              <Link
                key={cat.value}
                href={`/campaigns?cat=${cat.value}`}
                className="card fade-up"
                style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', textDecoration: 'none', display: 'block' }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">How TrustChain Works</h2>
            <p className="section-desc">Simple, transparent, and fully autonomous on the Mantle blockchain.</p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>1. Create or Discover</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Launch a verified fundraising campaign in minutes or browse community causes across global categories.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>2. Donate in MNT</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Connect your EVM wallet and donate testnet MNT with near-zero gas fees. Funds are held safely in escrow.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>3. Receive On-Chain NFT</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every donation automatically mints an immutable, tiered on-chain SVG NFT receipt straight to your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
