import type { Metadata } from 'next';
import { Providers } from './providers';
import { GoogleAnalyticsLoader } from '../components/GoogleAnalyticsLoader';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'Finance Tracker V3',
  description: 'Quản lý tài chính cá nhân với Safe-to-Spend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning>
        <GoogleAnalyticsLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
