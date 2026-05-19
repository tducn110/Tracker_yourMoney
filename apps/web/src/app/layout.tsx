import type { Metadata } from 'next';
import { Providers } from './providers';
import { GoogleAnalytics } from '../components/GoogleAnalytics';
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
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
