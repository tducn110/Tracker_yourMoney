'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/_lib/hooks/finance';
import { Transaction } from '@finance/api-client';
import Decimal from 'decimal.js';
import { TransactionsView, FilterType, SortOrder } from './TransactionsView';

export function TransactionsContainer() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Fetch transactions from API
  const { data: apiTransactions = [], isLoading } = useTransactions({ limit: 100 });

  const filtered = useMemo(() => {
    let list = apiTransactions.filter((tx: Transaction) => {
      const q = search.toLowerCase();
      const noteMatch = tx.note?.toLowerCase().includes(q) ?? false;
      const catMatch = tx.categoryName?.toLowerCase().includes(q) ?? false;
      const ok = !q || noteMatch || catMatch;
      return ok && (filter === 'all' || tx.type === filter);
    });

    if (sortOrder === 'oldest') {
      list = [...list].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    if (sortOrder === 'newest') {
      list = [...list].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    if (sortOrder === 'amount_desc') {
      list = [...list].sort(
        (a, b) =>
          new Decimal(b.amount).abs().toNumber() -
          new Decimal(a.amount).abs().toNumber()
      );
    }
    if (sortOrder === 'amount_asc') {
      list = [...list].sort(
        (a, b) =>
          new Decimal(a.amount).abs().toNumber() -
          new Decimal(b.amount).abs().toNumber()
      );
    }

    return list;
  }, [search, filter, sortOrder, apiTransactions]);

  // Group by date (preserve sort order)
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      if (!map.has(tx.date)) map.set(tx.date, []);
      map.get(tx.date)!.push(tx);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <TransactionsView
      isLoading={isLoading}
      totalTransactions={apiTransactions.length}
      filteredTransactions={filtered}
      groupedTransactions={grouped}
      search={search}
      onSearchChange={setSearch}
      filter={filter}
      onFilterChange={setFilter}
      sortOrder={sortOrder}
      onSortChange={setSortOrder}
    />
  );
}
