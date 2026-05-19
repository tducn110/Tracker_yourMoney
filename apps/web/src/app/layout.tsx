import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { GoogleAnalyticsLoader } from '../components/GoogleAnalyticsLoader';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'Finance Tracker V3',
  description: 'Quản lý tài chính cá nhân với Safe-to-Spend',
};

// Self-host Google Fonts via next/font — eliminates render-blocking
// @import url(...) that was previously in fonts.css (~300ms savings).
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body suppressHydrationWarning>
        <GoogleAnalyticsLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
