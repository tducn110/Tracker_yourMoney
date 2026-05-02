-- Migration 0014: Phase 4 + Phase 8 — Performance indexes + audit trail
-- Phase 4: Add targeted composite indexes for Budget Engine queries
-- Phase 8: Create audit_logs + notifications tables

-- ⚡ Budget Engine: WHERE userId=? AND type='expense' AND displayDate BETWEEN ? AND ?
ALTER TABLE `transactions` ADD INDEX `idx_tx_user_type_date` (`user_id`, `type`, `display_date`);

-- ⚡ Worker cron job: WHERE userId=? AND frequency=?
ALTER TABLE `bills` ADD INDEX `idx_bills_user_freq` (`user_id`, `frequency`);

-- TABLE: notifications (system notifications for bills, budgets, goals)
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` bigint unsigned NOT NULL,
  `type` enum('bill_due','bill_overdue','budget_warning','budget_exceeded','goal_completed','goal_milestone','low_balance','budget_negative','system','tip') NOT NULL,
  `title` varchar(150) NOT NULL,
  `body` text NOT NULL,
  `icon` varchar(20) NOT NULL DEFAULT '🔔',
  `action_url` varchar(255),
  `is_read` tinyint NOT NULL DEFAULT 0,
  `read_at` timestamp NULL,
  `expires_at` timestamp NULL,
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT now(),
  INDEX `idx_notif_user_unread` (`user_id`, `is_read`, `created_at`),
  INDEX `idx_notif_user_type` (`user_id`, `type`),
  INDEX `idx_notif_expires` (`expires_at`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: audit_logs (CRUD audit trail)
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` bigint unsigned NULL,
  `action` varchar(100) NOT NULL,
  `resource` varchar(100),
  `resource_id` varchar(50),
  `old_values` json,
  `new_values` json,
  `ip_address` varchar(45),
  `user_agent` varchar(500),
  `status` enum('success', 'failed') NOT NULL DEFAULT 'success',
  `created_at` timestamp NOT NULL DEFAULT now(),
  INDEX `idx_audit_user` (`user_id`, `created_at`),
  INDEX `idx_audit_action` (`action`, `created_at`),
  INDEX `idx_audit_resource` (`resource`, `resource_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
