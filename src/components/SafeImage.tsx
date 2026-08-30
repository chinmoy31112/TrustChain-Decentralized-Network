'use client';

import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&q=80';

// SVG Data URI fallback banner for guaranteed visual display if all external URLs fail
const SVG_FALLBACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230d0d2b"/><stop offset="50%" stop-color="%231a1a4b"/><stop offset="100%" stop-color="%2300d4aa" stop-opacity="0.3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="400" cy="225" r="100" fill="%2300d4aa" fill-opacity="0.1"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="%2300d4aa" font-family="sans-serif" font-size="48">🔗</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold">TrustChain Charity</text></svg>`;

export function formatImageUrl(rawUrl?: string): string {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_FALLBACK;
  let url = rawUrl.trim();

  // Convert IPFS URIs (ipfs://CID or /ipfs/CID)
  if (url.startsWith('ipfs://')) {
    url = url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  } else if (url.includes('/ipfs/')) {
    const cid = url.split('/ipfs/')[1];
    url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  // Convert Unsplash page URLs to direct image URLs
  // e.g., https://unsplash.com/photos/xyz -> https://images.unsplash.com/photo-xyz?w=800&auto=format
  if (url.includes('unsplash.com/photos/')) {
    const photoId = url.split('unsplash.com/photos/')[1]?.split('/')[0]?.split('?')[0];
    if (photoId) {
      url = `https://images.unsplash.com/photo-${photoId}?w=800&auto=format`;
    }
  }

  // Convert Imgur page URLs to direct image URLs
  if (url.includes('imgur.com/') && !url.includes('i.imgur.com')) {
    const imgurId = url.split('imgur.com/')[1]?.split('?')[0];
    if (imgurId) {
      url = `https://i.imgur.com/${imgurId}.jpg`;
    }
  }

  return url;
}

export function SafeImage({ src, alt, fallbackSrc = DEFAULT_FALLBACK, className, style, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => formatImageUrl(src));
  const [errorCount, setErrorCount] = useState<number>(0);

  useEffect(() => {
    setImgSrc(formatImageUrl(src));
    setErrorCount(0);
  }, [src]);

  const handleError = () => {
    if (errorCount === 0) {
      setErrorCount(1);
      setImgSrc(fallbackSrc);
    } else if (errorCount === 1) {
      setErrorCount(2);
      setImgSrc(SVG_FALLBACK);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt || 'Campaign Image'}
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}
