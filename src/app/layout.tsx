import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WrongNetworkBanner } from '../components/WrongNetworkBanner';

export const metadata: Metadata = {
  title: 'TrustChain — Decentralized Charity Platform on Mantle Sepolia',
  description: 'TrustChain is a decentralized charity platform on Mantle Sepolia Testnet with transparent on-chain donations and dynamic SVG NFT receipts.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔗</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <WrongNetworkBanner />
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - var(--nav-height) - 200px)' }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
