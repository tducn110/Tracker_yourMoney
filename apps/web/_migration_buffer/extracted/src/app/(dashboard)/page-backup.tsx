'use client';

/**
 * Dashboard — Finance Tracker V3 — BACKUP
 * Original full-featured dashboard
 */

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Target,
  Calendar,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  formatVND,
  mockFinanceData,
  mockTransactions,
  mockGoals,
  mockBills,
  mockS2SData,
} from '../data/mockData';
import { S2SHeroSection } from '../_components/s2s/S2SHeroSection';
import { CashWalletStrip } from '../_components/wallet/CashWalletStrip';

// Placeholder - will be restored after testing
export default function DashboardPageBackup() {
  return <div>Backup</div>;
}
