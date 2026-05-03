-- Migration 0016: FULLTEXT index on transactions.note for text search
-- The LIKE '%search%' pattern in getTransactionsPaginated can't use B-tree indexes.
-- FULLTEXT index enables fast natural language search on note content.

ALTER TABLE `transactions` ADD FULLTEXT INDEX `ft_tx_note` (`note`);
