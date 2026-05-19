import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Providers } from './providers';
import { GoogleAnalyticsLoader } from '../components/GoogleAnalyticsLoader';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'Finance Tracker V3',
  description: 'Quản lý tài chính cá nhân với Safe-to-Spend',
};

// Self-host Be Vietnam Pro via next/font — eliminates render-blocking
// Google Fonts @import, and provides better Vietnamese character rendering.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-main',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body suppressHydrationWarning>
        <GoogleAnalyticsLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
