# Finance Tracker — Database Schema (TiDB Serverless + Drizzle ORM) — Full Reference

> **Database Engine:** TiDB Serverless (MySQL 8.x compatible)
> **ORM:** Drizzle ORM v0.30+ với `@tidbcloud/serverless` HTTP Driver
> **Charset:** `utf8mb4` | **Collation:** `utf8mb4_unicode_ci`
> **Last updated:** April 1, 2026 — v12.0 (V12 Lite merge: display_date, initial_balance, transfer type, Zod + DB init)
> **Workspace:** `packages/db` trong Monorepo Turborepo

## DANH SÁCH BẢNG

**Phase 1 — MVP Core (triển khai ngay):**

| #   | Table            | Mô tả                                      |
| --- | ---------------- | ------------------------------------------ |
| 1   | `users`          | Tài khoản người dùng, xác thực             |
| 2   | `user_settings`  | Cấu hình tài chính cá nhân (1-1 với users) |
| 3   | `refresh_tokens` | JWT refresh token management               |
| 4   | `categories`     | Danh mục thu/chi (system + user-defined)   |
| 5   | `transactions`   | Nhật ký giao dịch tài chính                |
| 6   | `bills`          | Hóa đơn cố định định kỳ                    |
| 7   | `bill_payments`  | Lịch sử thanh toán hóa đơn                 |
| 8   | `goals`          | Mục tiêu tiết kiệm dài hạn                 |
| 9   | `cash_wallet`    | Ví tiền mặt (1-1 với users)                |

**Phase 2 — Extended (migrate khi cần):**

| #   | Table              | Mô tả                          | Trigger                                  |
| --- | ------------------ | ------------------------------ | ---------------------------------------- |
| 10  | `cash_wallet_logs` | Lịch sử Quick Sync ví tiền mặt | Khi có nhiều users cần audit trail ví    |
| 11  | `notifications`    | Thông báo hệ thống cho user    | Khi implement push/in-app notification   |
| 12  | `audit_logs`       | Ghi log thao tác quan trọng    | Khi cần compliance hoặc debug production |

---

## SƠ ĐỒ QUAN HỆ (ERD Summary)

```
users (1) ──── (1) user_settings
users (1) ──── (N) refresh_tokens
users (1) ──── (N) transactions ──── (N:1) categories
users (1) ──── (N) bills
bills  (1) ──── (N) bill_payments
users (1) ──── (N) goals
users (1) ──── (1) cash_wallet
cash_wallet (1) ──── (N) cash_wallet_logs
users (1) ──── (N) notifications
users (1) ──── (N) audit_logs
categories (system) ──── không có user_id (global)
categories (user) ──── (N:1) users (nullable user_id)
```

## // data đây này từ data flow nma của app t chứ k phải của money lover

## FULL SQL SCHEMA (TiDB Serverless — MySQL 8.x compatible)

```sql
-- =====================================================
-- Finance Tracker DATABASE — COMPLETE TABLE SCHEMA
-- TiDB Serverless (MySQL 8.x compatible)
-- utf8mb4_unicode_ci | InnoDB-compatible
-- =====================================================
-- ⚠️ KHÔNG CÓ: Views, Stored Procedures, Triggers
-- Logic nghiệp vụ nằm tại: apps/api/src/services/
-- =====================================================

-- Xóa theo thứ tự ngược dependency (FK-safe)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS cash_wallet_logs;
DROP TABLE IF EXISTS cash_wallet;
DROP TABLE IF EXISTS bill_payments;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;


-- =====================================================
-- TABLE 1: users
-- Lưu thông tin tài khoản người dùng
-- PK: id (BIGINT UNSIGNED AUTO_INCREMENT)
-- =====================================================

CREATE TABLE users (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50)   NOT NULL UNIQUE    COMMENT 'Tên đăng nhập, duy nhất',
    email          VARCHAR(255)  NOT NULL UNIQUE    COMMENT 'Email đăng nhập',
    password_hash  VARCHAR(255)  NOT NULL           COMMENT 'bcrypt hash, cost=12',
    full_name      VARCHAR(100)  NOT NULL           COMMENT 'Tên hiển thị',
    avatar_url     VARCHAR(500)  NULL               COMMENT 'URL ảnh đại diện (Vercel Blob / Cloudinary)',
    avatar_text    VARCHAR(5)    NULL               COMMENT 'Fallback initials, vd: TD',
    is_active      TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '1=active, 0=banned',
    email_verified TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1=đã xác minh email',
    last_login_at  TIMESTAMP     NULL               COMMENT 'Lần đăng nhập cuối',
    deleted_at     TIMESTAMP     NULL DEFAULT NULL  COMMENT 'Soft delete: NULL=active',
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email    (email),
    INDEX idx_users_username (username),
    INDEX idx_users_active   (is_active, deleted_at)
) COMMENT='Tài khoản người dùng Finance Tracker';


-- =====================================================
-- TABLE 2: user_settings
-- Cấu hình tài chính cá nhân — 1:1 với users
-- PK: user_id (FK → users.id)
-- NOTE: Record được tạo bởi apps/api/services/user-service.ts
--       (initializeNewUser) thay vì Trigger
-- =====================================================

CREATE TABLE user_settings (
    user_id                 BIGINT UNSIGNED NOT NULL,
    monthly_budget          DECIMAL(15,2)   NOT NULL DEFAULT 0.00  COMMENT 'Ngân sách chi tiêu hàng tháng (VNĐ)',
    emergency_buffer        DECIMAL(15,2)   NOT NULL DEFAULT 0.00  COMMENT 'Quỹ khẩn cấp dự trữ (VNĐ)',
    income_date             TINYINT         NOT NULL DEFAULT 1     COMMENT 'Ngày nhận lương trong tháng (1-31)',
    currency                VARCHAR(10)     NOT NULL DEFAULT 'VND' COMMENT 'Đơn vị tiền tệ: VND, USD, ...',
    language                VARCHAR(10)     NOT NULL DEFAULT 'vi'  COMMENT 'Ngôn ngữ UI',
    timezone                VARCHAR(50)     NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    theme                   ENUM('light','dark','system') NOT NULL DEFAULT 'light',
    notify_bill_before_days TINYINT         NOT NULL DEFAULT 3     COMMENT 'Nhắc hóa đơn trước N ngày',
    notify_budget_threshold DECIMAL(5,2)    NOT NULL DEFAULT 80.00 COMMENT 'Cảnh báo khi dùng X% ngân sách',
    notify_email            TINYINT(1)      NOT NULL DEFAULT 1     COMMENT 'Bật thông báo qua email',
    notify_push             TINYINT(1)      NOT NULL DEFAULT 1     COMMENT 'Bật push notification (PWA)',
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    CONSTRAINT fk_user_settings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Cài đặt tài chính cá nhân của user (1:1 với users)';


-- =====================================================
-- TABLE 3: refresh_tokens
-- Quản lý JWT refresh tokens
-- PK: id | FK: user_id → users.id
-- =====================================================

CREATE TABLE refresh_tokens (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    token_hash  VARCHAR(255)    NOT NULL UNIQUE COMMENT 'SHA-256 hash của refresh token',
    device_info VARCHAR(255)    NULL            COMMENT 'User-Agent / device description',
    ip_address  VARCHAR(45)     NULL            COMMENT 'IPv4 hoặc IPv6',
    expires_at  TIMESTAMP       NOT NULL        COMMENT 'Thời hạn hết token',
    revoked_at  TIMESTAMP       NULL DEFAULT NULL COMMENT 'NULL=còn hiệu lực',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_refresh_token_user   (user_id),
    INDEX idx_refresh_token_hash   (token_hash),
    INDEX idx_refresh_token_expiry (expires_at),
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='JWT refresh token management';


-- =====================================================
-- TABLE 4: categories
-- Danh mục thu/chi — system global + user custom
-- PK: id | FK: user_id → users.id (nullable)
-- =====================================================

CREATE TABLE categories (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NULL DEFAULT NULL  COMMENT 'NULL=system category, có giá trị=user category',
    name       VARCHAR(50)     NOT NULL            COMMENT 'Tên danh mục',
    type       ENUM('income','expense','both') NOT NULL DEFAULT 'expense',
    icon       VARCHAR(20)     NOT NULL DEFAULT '📦' COMMENT 'Emoji icon',
    color      VARCHAR(7)      NOT NULL DEFAULT '#6B7280' COMMENT 'Hex color cho chart',
    is_default TINYINT(1)      NOT NULL DEFAULT 0  COMMENT '1=danh mục mặc định hệ thống',
    sort_order SMALLINT        NOT NULL DEFAULT 0  COMMENT 'Thứ tự hiển thị',
    deleted_at TIMESTAMP       NULL DEFAULT NULL   COMMENT 'Soft delete',
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_category_name_user (user_id, name),
    INDEX idx_categories_user (user_id),
    INDEX idx_categories_type (type),
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Danh mục thu/chi — system global (user_id=NULL) + user custom';


-- =====================================================
-- TABLE 5: transactions
-- Nhật ký giao dịch tài chính (core table)
-- PK: id | FK: user_id → users.id | category_id → categories.id
-- =====================================================
-- [v12.0-A] display_date DATE thay vì executed_at TIMESTAMP
--   Thiết kế "Pure Tracker": user tự chọn ngày hiển thị trên sổ cái.
--   Họ có thể log giao dịch của tuần trước với đúng ngày đó → DATE là đúng ngữ nghĩa.
--   KHÔNG có vấn đề timezone vì đây là ngày USER kiểm soát, không phải system clock.
--   created_at TIMESTAMP (đã có sẵn) = audit trail khi nào record được tạo.
--   Budget-First Engine filter theo: display_date BETWEEN '2026-04-01' AND '2026-04-30'
--
-- [v12.0-B] Bỏ currency_code, exchange_rate, base_amount → Phase 2
--   MVP = VND-only. Thêm 3 cột này khi expand multi-currency (migration script riêng).
--
-- [v12.0-C] Thêm 'transfer' vào type enum
--   Giao dịch chuyển tiền giữa tài khoản/ví tiền mặt là use case thực tế.
-- =====================================================

CREATE TABLE transactions (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT UNSIGNED NOT NULL,
    category_id  INT UNSIGNED    NOT NULL,
    amount       DECIMAL(15,2)   NOT NULL              COMMENT 'Số tiền (luôn dương). VND-only ở MVP.',
    type         ENUM('income','expense','transfer') NOT NULL COMMENT 'Loại: thu / chi / chuyển khoản',
    note         VARCHAR(500)    NULL                   COMMENT 'Ghi chú tự do',
    display_date DATE            NOT NULL               COMMENT 'Ngày user chọn cho sổ cái (có thể là ngày quá khứ)',
    receipt_url  VARCHAR(500)    NULL                   COMMENT 'URL ảnh hóa đơn (Vercel Blob / Cloudinary)',
    source       ENUM('manual','quick_add','ocr','import','recurring') NOT NULL DEFAULT 'manual',
    deleted_at   TIMESTAMP       NULL DEFAULT NULL      COMMENT 'Soft delete',
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Audit: khi nào record được tạo (UTC)',
    updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Phase 2 columns (add via migration when needed):
    -- currency_code VARCHAR(10)  NOT NULL DEFAULT 'VND',
    -- exchange_rate DECIMAL(18,6) NOT NULL DEFAULT 1.000000,
    -- base_amount   DECIMAL(15,2) NOT NULL,

    INDEX idx_tx_user_date    (user_id, display_date),
    INDEX idx_tx_user_type    (user_id, type),
    INDEX idx_tx_user_cat     (user_id, category_id),
    INDEX idx_tx_user_month   (user_id, display_date, deleted_at),
    INDEX idx_tx_deleted      (deleted_at),

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_tx_amount_positive
        CHECK (amount > 0)
) COMMENT='Nhật ký giao dịch tài chính — bảng cốt lõi (Pure Tracker, VND-only MVP)';


-- =====================================================
-- TABLE 6: bills
-- Hóa đơn & chi phí cố định định kỳ
-- PK: id | FK: user_id → users.id | category_id → categories.id
-- NOTE: bill_payments records được tạo bởi
--       apps/api/services/bill-service.ts (generateBillPaymentsForMonth)
--       thay vì Stored Procedure
-- =====================================================

CREATE TABLE bills (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    category_id INT UNSIGNED    NOT NULL,
    name        VARCHAR(100)    NOT NULL              COMMENT 'Tên hóa đơn: Tiền trọ, Internet...',
    icon        VARCHAR(20)     NOT NULL DEFAULT '📄' COMMENT 'Emoji icon hiển thị',
    amount      DECIMAL(15,2)   NOT NULL              COMMENT 'Số tiền định kỳ',
    due_day     TINYINT         NOT NULL              COMMENT 'Ngày đến hạn trong tháng (1-31)',
    frequency   ENUM('monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
    auto_pay    TINYINT(1)      NOT NULL DEFAULT 0    COMMENT '1=tự động đánh dấu paid',
    is_active   TINYINT(1)      NOT NULL DEFAULT 1    COMMENT '0=tạm dừng',
    notes       TEXT            NULL                  COMMENT 'Ghi chú thêm',
    deleted_at  TIMESTAMP       NULL DEFAULT NULL     COMMENT 'Soft delete',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_bills_user        (user_id, is_active),
    INDEX idx_bills_user_dueday (user_id, due_day),
    INDEX idx_bills_deleted     (deleted_at),

    CONSTRAINT fk_bills_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bills_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_bills_amount_positive
        CHECK (amount > 0),
    CONSTRAINT chk_bills_due_day
        CHECK (due_day BETWEEN 1 AND 31)
) COMMENT='Hóa đơn cố định định kỳ (tiền trọ, điện nước, subscription...)';


-- =====================================================
-- TABLE 7: bill_payments
-- Lịch sử thanh toán từng kỳ của bills
-- PK: id | FK: bill_id → bills.id | user_id → users.id
-- =====================================================
-- [FIX #3] Xóa UNIQUE KEY uq_bill_period (bill_id, period_month)
--   Vấn đề cũ: Unique constraint ép mỗi kỳ chỉ có 1 record.
--   Hậu quả: Hóa đơn 5 triệu, user trả trước 2 triệu → hệ thống văng Duplicate Entry.
--   Giải pháp mới: Mỗi row = 1 sự kiện thanh toán (payment event), có thể N events/kỳ.
--   Trạng thái tổng hợp tính tại API layer (bill-service.ts):
--     SUM(amount_paid) WHERE bill_id=? AND period_month=?
--     → "paid"    nếu SUM >= bill.amount
--     → "partial" nếu 0 < SUM < bill.amount
--     → "pending" nếu SUM = 0 (chưa có payment event nào trong kỳ)
-- =====================================================

CREATE TABLE bill_payments (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bill_id      BIGINT UNSIGNED NOT NULL,
    user_id      BIGINT UNSIGNED NOT NULL,
    period_month CHAR(7)         NOT NULL    COMMENT 'Kỳ thanh toán: YYYY-MM, vd: 2026-03',
    amount_paid  DECIMAL(15,2)   NOT NULL    COMMENT 'Số tiền trả trong lần này (NOT NULL — mỗi row là 1 payment event thực tế)',
    paid_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm thực hiện thanh toán này',
    note         VARCHAR(255)    NULL,
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Không có updated_at: payment event là immutable (ghi rồi không sửa)

    -- Không có UNIQUE KEY → N payment events cùng (bill_id, period_month) là hợp lệ
    INDEX idx_bill_payments_user        (user_id, period_month),
    INDEX idx_bill_payments_bill_period (bill_id, period_month),  -- dùng cho SUM query

    CONSTRAINT fk_bill_payments_bill
        FOREIGN KEY (bill_id) REFERENCES bills(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bill_payments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_bill_payment_positive
        CHECK (amount_paid > 0)
) COMMENT='Lịch sử thanh toán từng kỳ — mỗi row là 1 payment event (partial payments OK)';


-- =====================================================
-- TABLE 8: goals
-- Mục tiêu tiết kiệm dài hạn
-- PK: id | FK: user_id → users.id
-- NOTE: status='completed' và completed_at được set bởi
--       apps/api/services/goal-service.ts (checkAndCompleteGoal)
--       thay vì Trigger
-- =====================================================

CREATE TABLE goals (
    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT UNSIGNED NOT NULL,
    name                 VARCHAR(100)    NOT NULL         COMMENT 'Tên mục tiêu: Mua iPhone, Du lịch...',
    icon                 VARCHAR(20)     NOT NULL DEFAULT '🎯' COMMENT 'Emoji icon',
    target_amount        DECIMAL(15,2)   NOT NULL         COMMENT 'Số tiền cần đạt',
    current_saved        DECIMAL(15,2)   NOT NULL DEFAULT 0.00 COMMENT 'Đã tiết kiệm được',
    monthly_contribution DECIMAL(15,2)   NOT NULL DEFAULT 0.00 COMMENT 'Cam kết tiết kiệm hàng tháng',
    deadline             DATE            NULL             COMMENT 'Hạn chót (MM/YYYY)',
    status               ENUM('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
    priority             TINYINT         NOT NULL DEFAULT 1 COMMENT 'Ưu tiên: 1=cao, 2=tb, 3=thấp',
    notes                TEXT            NULL,
    completed_at         TIMESTAMP       NULL DEFAULT NULL COMMENT 'Thời điểm hoàn thành mục tiêu',
    deleted_at           TIMESTAMP       NULL DEFAULT NULL COMMENT 'Soft delete',
    created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_goals_user_status   (user_id, status, deleted_at),
    INDEX idx_goals_user_deadline (user_id, deadline),

    CONSTRAINT fk_goals_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_goals_amounts
        CHECK (target_amount > 0 AND current_saved >= 0 AND monthly_contribution >= 0),
    CONSTRAINT chk_goals_saved_lte_target
        CHECK (current_saved <= target_amount * 1.01) -- 1% tolerance cho rounding
) COMMENT='Mục tiêu tiết kiệm dài hạn';


-- =====================================================
-- TABLE 9: cash_wallet
-- Ví tiền mặt — 1:1 với users
-- PK: user_id | FK: user_id → users.id
-- NOTE: Record được tạo bởi apps/api/services/user-service.ts
--       (initializeNewUser) thay vì Trigger
-- =====================================================

CREATE TABLE cash_wallet (
    user_id         BIGINT UNSIGNED NOT NULL,
    initial_balance DECIMAL(15,2)   NOT NULL DEFAULT 0.00 COMMENT 'Số dư ví khi user onboard — baseline bất biến sau khi set',
    balance         DECIMAL(15,2)   NOT NULL DEFAULT 0.00 COMMENT 'Số dư ví hiện tại (updated bởi wallet-service.ts)',
    -- net_change = balance - initial_balance (tính tại API, không lưu DB)
    last_synced_at  TIMESTAMP       NULL DEFAULT NULL     COMMENT 'Lần Quick Sync gần nhất',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    CONSTRAINT fk_cash_wallet_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_cash_balance_non_negative
        CHECK (balance >= 0),
    CONSTRAINT chk_cash_initial_non_negative
        CHECK (initial_balance >= 0)
) COMMENT='Ví tiền mặt (1:1 với users) — initial_balance là baseline onboarding';


-- =====================================================
-- TABLE 10: cash_wallet_logs
-- Lịch sử cập nhật ví tiền mặt (Quick Sync history)
-- PK: id | FK: user_id → users.id
-- NOTE: Insert được thực hiện bởi
--       apps/api/services/wallet-service.ts thay vì Stored Procedure
-- =====================================================

CREATE TABLE cash_wallet_logs (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT UNSIGNED NOT NULL,
    balance_before DECIMAL(15,2)   NOT NULL     COMMENT 'Số dư trước khi sync',
    balance_after  DECIMAL(15,2)   NOT NULL     COMMENT 'Số dư sau khi sync',
    difference     DECIMAL(15,2)   NOT NULL     COMMENT 'Chênh lệch = after - before (âm = đã chi)',
    note           VARCHAR(255)    NULL         COMMENT 'Ghi chú (vd: Chi phí lặt vặt)',
    auto_tx_id     BIGINT UNSIGNED NULL         COMMENT 'FK tới transactions nếu tự động tạo giao dịch',
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_wallet_logs_user (user_id, created_at),

    CONSTRAINT fk_wallet_logs_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_wallet_logs_tx
        FOREIGN KEY (auto_tx_id) REFERENCES transactions(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) COMMENT='Lịch sử Quick Sync ví tiền mặt';


-- =====================================================
-- TABLE 11: notifications
-- Thông báo hệ thống cho user
-- PK: id | FK: user_id → users.id
-- NOTE: Insert được thực hiện bởi
--       apps/api/services/notification-service.ts thay vì Trigger
-- =====================================================

CREATE TABLE notifications (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL,
    type       ENUM(
                   'bill_due',
                   'bill_overdue',
                   'budget_warning',
                   'budget_exceeded',
                   'goal_completed',
                   'goal_milestone',
                   'low_balance',
                   'budget_negative',
                   'system',
                   'tip'
               ) NOT NULL,
    title      VARCHAR(150)    NOT NULL,
    body       TEXT            NOT NULL,
    icon       VARCHAR(20)     NOT NULL DEFAULT '🔔',
    action_url VARCHAR(255)    NULL     COMMENT 'Đường dẫn khi click thông báo',
    is_read    TINYINT(1)      NOT NULL DEFAULT 0,
    read_at    TIMESTAMP       NULL DEFAULT NULL,
    expires_at TIMESTAMP       NULL DEFAULT NULL COMMENT 'NULL=không hết hạn',
    metadata   JSON            NULL     COMMENT 'Extra data: bill_id, goal_id, ...',
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notif_user_unread (user_id, is_read, created_at),
    INDEX idx_notif_user_type   (user_id, type),
    INDEX idx_notif_expires     (expires_at),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Thông báo hệ thống cho user (bill due, budget warning, ...)';


-- =====================================================
-- TABLE 12: audit_logs
-- Ghi log thao tác quan trọng (security & debugging)
-- PK: id | FK: user_id → users.id (nullable)
-- NOTE: Insert được thực hiện bởi
--       apps/api/middleware/audit.ts thay vì Trigger
-- =====================================================

CREATE TABLE audit_logs (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NULL             COMMENT 'NULL nếu system action',
    action      VARCHAR(100)    NOT NULL         COMMENT 'vd: user.login, transaction.delete',
    resource    VARCHAR(100)    NULL             COMMENT 'vd: transactions, goals',
    resource_id VARCHAR(50)     NULL             COMMENT 'ID của record bị tác động',
    old_values  JSON            NULL             COMMENT 'Giá trị trước khi thay đổi',
    new_values  JSON            NULL             COMMENT 'Giá trị sau khi thay đổi',
    ip_address  VARCHAR(45)     NULL,
    user_agent  VARCHAR(500)    NULL,
    status      ENUM('success','failed') NOT NULL DEFAULT 'success',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_audit_user     (user_id, created_at),
    INDEX idx_audit_action   (action, created_at),
    INDEX idx_audit_resource (resource, resource_id),

    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) COMMENT='Audit log cho security và debugging';
```

---

## DRIZZLE ORM SCHEMA (`packages/db/src/schema/`)

> Drizzle ORM cung cấp type-safe schema definitions trong TypeScript. Các file này là **source of truth** cho kiến trúc Monorepo — SQL phía trên chỉ là reference.

> **[FIX #4] QUY TẮC BẮT BUỘC — BIGINT MODE:** Tất cả `bigint` fields PHẢI dùng `mode: "string"`.
> TiDB Serverless pre-allocates Auto Increment ID theo block để tối ưu distributed writes.
> ID có thể nhảy vọt lên `3_000_000_000_000_000`. JavaScript `Number.MAX_SAFE_INTEGER = 9_007_199_254_740_991`.
> `mode: "number"` → Drizzle làm tròn sai khi ID vượt mốc này → lấy/update nhầm record → silent data corruption.
> **Hệ quả:** `user.id` sẽ là `string` `"1"`, `"2"`... Khi so sánh: `user.id === ctx.userId` (string-to-string). Không dùng `Number(user.id)` hay `==`.

### `schema/users.ts`

```typescript
import {
  bigint,
  varchar,
  tinyint,
  timestamp,
  mysqlTable,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    // [FIX #4] mode: "string" — bắt buộc với TiDB Serverless distributed ID
    id: bigint("id", { mode: "string", unsigned: true })
      .autoincrement()
      .primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    avatarText: varchar("avatar_text", { length: 5 }),
    isActive: tinyint("is_active").notNull().default(1),
    emailVerified: tinyint("email_verified").notNull().default(0),
    lastLoginAt: timestamp("last_login_at"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    usernameIdx: index("idx_users_username").on(table.username),
    activeIdx: index("idx_users_active").on(table.isActive, table.deletedAt),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
// user.id: string  →  so sánh: user.id === "1" ✅  |  user.id === 1 ❌
```

### `schema/transactions.ts`

```typescript
import {
  bigint,
  int,
  decimal,
  varchar,
  timestamp,
  date,
  mysqlTable,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./users";
import { categories } from "./categories";

export const transactions = mysqlTable(
  "transactions",
  {
    id: bigint("id", { mode: "string", unsigned: true })
      .autoincrement()
      .primaryKey(),
    userId: bigint("user_id", { mode: "string", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: int("category_id", { unsigned: true })
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),

    // The Decimal Trap: amount là string khi đọc từ DB → không .toNumber() trực tiếp
    // Dùng: new Decimal(tx.amount) hoặc parseDecimal(tx.amount) tại API layer
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),

    // [v12.0-C] 'transfer' cho phép ghi nhận chuyển tiền giữa tài khoản/ví
    type: mysqlEnum("type", ["income", "expense", "transfer"]).notNull(),
    note: varchar("note", { length: 500 }),

    // [v12.0-A] display_date: ngày user chọn để hiển thị trên sổ cái
    // Semantic: "Giao dịch này thuộc ngày nào?" — user kiểm soát, không phải system clock
    // User có thể nhập "hôm qua", "tuần trước" → không timezone confusion
    // Budget-First Engine: WHERE display_date BETWEEN '2026-04-01' AND '2026-04-30'
    displayDate: date("display_date").notNull(),

    receiptUrl: varchar("receipt_url", { length: 500 }),
    source: mysqlEnum("source", [
      "manual",
      "quick_add",
      "ocr",
      "import",
      "recurring",
    ])
      .notNull()
      .default("manual"),
    deletedAt: timestamp("deleted_at"),
    // createdAt = audit trail: khi nào user bấm Submit (UTC)
    // Luôn khác displayDate nếu user log giao dịch quá khứ
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),

    // Phase 2 — multi-currency (uncomment + migration khi expand):
    // currencyCode: varchar("currency_code", { length: 10 }).notNull().default("VND"),
    // exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).notNull().default("1.000000"),
    // baseAmount:   decimal("base_amount", { precision: 15, scale: 2 }).notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_tx_user_date").on(table.userId, table.displayDate),
    userTypeIdx: index("idx_tx_user_type").on(table.userId, table.type),
    userCatIdx: index("idx_tx_user_cat").on(table.userId, table.categoryId),
    userMonthIdx: index("idx_tx_user_month").on(
      table.userId,
      table.displayDate,
      table.deletedAt,
    ),
    deletedIdx: index("idx_tx_deleted").on(table.deletedAt),
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
// tx.amount:      string "50000.00"
// tx.displayDate: string "2026-04-01"
// tx.userId:      string "1"
```

### `schema/bills.ts` (bao gồm billPayments)

```typescript
import {
  bigint,
  char,
  decimal,
  varchar,
  timestamp,
  mysqlTable,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

// bills table (rút gọn — định nghĩa đầy đủ trong file thực)
// ...

// [FIX #3 + #4] bill_payments — xóa UNIQUE constraint, mode: "string"
export const billPayments = mysqlTable(
  "bill_payments",
  {
    id: bigint("id", { mode: "string", unsigned: true })
      .autoincrement()
      .primaryKey(),
    billId: bigint("bill_id", { mode: "string", unsigned: true }).notNull(),
    userId: bigint("user_id", { mode: "string", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    periodMonth: char("period_month", { length: 7 }).notNull(),

    // [FIX #3] amountPaid NOT NULL — mỗi row là 1 payment event thực tế
    amountPaid: decimal("amount_paid", { precision: 15, scale: 2 }).notNull(),
    paidAt: timestamp("paid_at").notNull().defaultNow(),
    note: varchar("note", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    // Không có updatedAt — payment events là immutable
  },
  (table) => ({
    userPeriodIdx: index("idx_bill_payments_user").on(
      table.userId,
      table.periodMonth,
    ),
    // [FIX #3] Index cho SUM query thay vì UNIQUE constraint
    billPeriodIdx: index("idx_bill_payments_bill_period").on(
      table.billId,
      table.periodMonth,
    ),
  }),
);

export type BillPayment = typeof billPayments.$inferSelect;
export type NewBillPayment = typeof billPayments.$inferInsert;

// Tính trạng thái thanh toán tại apps/api/services/bill-service.ts:
//
// const [row] = await db
//   .select({ total: sum(billPayments.amountPaid) })
//   .from(billPayments)
//   .where(and(
//     eq(billPayments.billId, billId),
//     eq(billPayments.periodMonth, month)
//   ));
// const totalPaid = Number(row?.total ?? 0);
// const status =
//   totalPaid >= Number(bill.amount) ? "paid"    :
//   totalPaid > 0                    ? "partial" : "pending";
```

### `schema/goals.ts`

```typescript
import {
  bigint,
  varchar,
  decimal,
  tinyint,
  timestamp,
  date,
  mysqlTable,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const goals = mysqlTable(
  "goals",
  {
    // [FIX #4] mode: "string"
    id: bigint("id", { mode: "string", unsigned: true })
      .autoincrement()
      .primaryKey(),
    userId: bigint("user_id", { mode: "string", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 20 }).notNull().default("🎯"),
    targetAmount: decimal("target_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    currentSaved: decimal("current_saved", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    monthlyContribution: decimal("monthly_contribution", {
      precision: 15,
      scale: 2,
    })
      .notNull()
      .default("0"),
    deadline: date("deadline"),
    // status được set bởi goal-service.ts::checkAndCompleteGoal() — không dùng Trigger
    status: mysqlEnum("status", ["active", "completed", "paused", "cancelled"])
      .notNull()
      .default("active"),
    priority: tinyint("priority").notNull().default(1),
    notes: varchar("notes", { length: 65535 }),
    completedAt: timestamp("completed_at"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userStatusIdx: index("idx_goals_user_status").on(
      table.userId,
      table.status,
      table.deletedAt,
    ),
    userDeadlineIdx: index("idx_goals_user_deadline").on(
      table.userId,
      table.deadline,
    ),
  }),
);

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
```

### `schema/wallet.ts` (cash_wallet)

```typescript
import { bigint, decimal, timestamp, mysqlTable } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const cashWallet = mysqlTable("cash_wallet", {
  userId: bigint("user_id", { mode: "string", unsigned: true })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  // [v12.0-D] initial_balance: snapshot khi user onboard, immutable sau khi set
  // Net delta = balance - initial_balance (tính tại API, không lưu DB)
  initialBalance: decimal("initial_balance", { precision: 15, scale: 2 })
    .notNull()
    .default("0.00"),
  balance: decimal("balance", { precision: 15, scale: 2 })
    .notNull()
    .default("0.00"),

  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type CashWallet = typeof cashWallet.$inferSelect;
export type UpdateWallet = typeof cashWallet.$inferInsert;
// wallet.balance: string "500000.00"
// wallet.initialBalance: string "0.00"
```

### `schema/index.ts` — Re-export all

```typescript
export * from "./users";
export * from "./auth"; // refresh_tokens, user_settings
export * from "./categories";
export * from "./transactions";
export * from "./bills"; // bills, bill_payments
export * from "./goals";
export * from "./wallet"; // cash_wallet, cash_wallet_logs (Phase 2)
export * from "./notifications"; // Phase 2
export * from "./audit-logs"; // Phase 2
```

---

## ZOD SCHEMAS (`packages/shared-schemas/src/`)

> Zod schemas là **contract layer** giữa API endpoints và Drizzle inserts.
> **Zero-Trust Rule:** Response schemas phải `.omit({ passwordHash: true })` — không bao giờ leak password hash.
> **Decimal Rule:** Input là string hoặc number từ client → coerce sang string trước khi lưu DB.

### `schemas/user.schema.ts`

```typescript
import { z } from "zod";

// ── Insert (signup) ──────────────────────────────────────────────
export const insertUserSchema = z.object({
  email: z.string().email("Email không hợp lệ").max(255),
  password: z.string().min(8, "Tối thiểu 8 ký tự").max(100),
  fullName: z.string().min(1).max(100).trim(),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9_]+$/, "Chỉ dùng chữ thường, số, gạch dưới"),
});

// ── Response (public profile — KHÔNG có passwordHash) ────────────
export const userResponseSchema = z.object({
  id: z.string(), // bigint as string
  email: z.string().email(),
  fullName: z.string(),
  username: z.string(),
  avatarUrl: z.string().url().nullable(),
  avatarText: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
```

### `schemas/transaction.schema.ts`

```typescript
import { z } from "zod";

// ── Decimal string coercion helper ──────────────────────────────
// Nhận vào number hoặc string, output luôn là string decimal "50000.00"
const decimalString = z.union([z.string(), z.number()]).transform((val) => {
  const n = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(n) || n <= 0) throw new Error("Số tiền phải là số dương");
  return n.toFixed(2); // "50000.00"
});

// ── Insert ───────────────────────────────────────────────────────
export const insertTransactionSchema = z.object({
  categoryId: z.number().int().positive(),
  amount: decimalString,
  type: z.enum(["income", "expense", "transfer"]),
  note: z.string().max(500).optional(),
  // [v12.0-A] displayDate: user gửi string "YYYY-MM-DD" hoặc Date object
  displayDate: z.coerce.date().transform(
    (d) => d.toISOString().split("T")[0], // → "2026-04-01" (DATE string cho Drizzle)
  ),
  source: z
    .enum(["manual", "quick_add", "ocr", "import", "recurring"])
    .default("manual"),
  receiptUrl: z.string().url().optional(),
});

// ── Response ─────────────────────────────────────────────────────
export const transactionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  categoryId: z.number(),
  amount: z.string(), // "50000.00" — giữ nguyên string, client tự format
  type: z.enum(["income", "expense", "transfer"]),
  note: z.string().nullable(),
  displayDate: z.string(), // "2026-04-01"
  source: z.string(),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;
```

### `schemas/bill-payment.schema.ts`

```typescript
import { z } from "zod";

const decimalString = z.union([z.string(), z.number()]).transform((val) => {
  const n = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(n) || n <= 0) throw new Error("Số tiền phải là số dương");
  return n.toFixed(2);
});

// [Fix #3] Không có status — mỗi record là 1 payment event thực tế
export const insertBillPaymentSchema = z.object({
  billId: z.string(), // bigint string
  amountPaid: decimalString,
  periodMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format: YYYY-MM"),
  note: z.string().max(255).optional(),
  // paidAt: server tự set DEFAULT CURRENT_TIMESTAMP, không nhận từ client
});

export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
```

---

## DB CONNECTION (`packages/db/src/index.ts`)

> Boilerplate khởi tạo kết nối TiDB Serverless qua HTTP Driver — tương thích Vercel Edge Runtime (không cần TCP).

```typescript
// packages/db/src/index.ts
import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import * as schema from "./schema";

// DATABASE_URL format:
// mysql://username:password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/budget_finance?ssl={"rejectUnauthorized":true}

if (!process.env.DATABASE_URL) {
  throw new Error("[packages/db] DATABASE_URL is not set. Check .env.local");
}

// TiDB Serverless HTTP connection — works on Edge Runtime (no TCP required)
const connection = connect({ url: process.env.DATABASE_URL });

export const db = drizzle(connection, {
  schema,
  logger: process.env.NODE_ENV === "development", // log queries khi dev
});

// Re-export schema types để dùng ở apps/api
export * from "./schema";
export type { Transaction, NewTransaction } from "./schema";
export type { User, NewUser } from "./schema";
export type { Goal, NewGoal } from "./schema";
export type { BillPayment, NewBillPayment } from "./schema";
export type { CashWallet } from "./schema";
```

### `drizzle.config.ts` (packages/db root)

```typescript
// packages/db/drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Package scripts (`packages/db/package.json`)

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## INDEXES SUMMARY

```
users:
  idx_users_email            → Login lookup
  idx_users_username         → Username uniqueness check
  idx_users_active           → Active user filter

refresh_tokens:
  idx_refresh_token_user     → Get tokens by user
  idx_refresh_token_hash     → Token verification lookup
  idx_refresh_token_expiry   → Cleanup expired tokens

categories:
  idx_categories_user        → Get categories by user
  idx_categories_type        → Filter by income/expense

transactions (most queried table):
  idx_tx_user_date           → GET transactions by user + display_date range  [v12.0-A]
  idx_tx_user_type           → COUNT income/expense/transfer by user  [v12.0-C]
  idx_tx_user_cat            → GROUP BY category
  idx_tx_user_month          → Budget-First Engine: covering (userId, display_date, deleted_at)  [v12.0-A]
  idx_tx_deleted             → Cleanup / restore queries

bills:
  idx_bills_user             → Get active bills by user
  idx_bills_user_dueday      → Bills sorted by due date
  idx_bills_deleted          → Soft delete queries

bill_payments:
  idx_bill_payments_user         → Get payment events by user + period
  idx_bill_payments_bill_period  → SUM(amount_paid) WHERE bill_id + period_month  [FIX #3]
  (uq_bill_period ĐÃ XÓA → cho phép N payment events/kỳ)

goals:
  idx_goals_user_status      → Active goals by user (covering deleted_at)
  idx_goals_user_deadline    → Goals sorted by deadline

cash_wallet_logs:
  idx_wallet_logs_user       → Sync history by user

notifications:
  idx_notif_user_unread      → Unread count badge (covering index)
  idx_notif_user_type        → Filter by notification type
  idx_notif_expires          → Cleanup expired notifications

audit_logs:
  idx_audit_user             → Audit history by user
  idx_audit_action           → Filter by action type
  idx_audit_resource         → Filter by resource + resource_id
```

---

## FOREIGN KEY RELATIONSHIPS (Tổng hợp)

```
users.id ←───────── user_settings.user_id          (CASCADE DELETE/UPDATE)
users.id ←───────── refresh_tokens.user_id          (CASCADE DELETE/UPDATE)
users.id ←───────── categories.user_id              (CASCADE DELETE/UPDATE, NULLABLE)
users.id ←───────── transactions.user_id            (CASCADE DELETE/UPDATE)
users.id ←───────── bills.user_id                   (CASCADE DELETE/UPDATE)
users.id ←───────── bill_payments.user_id           (CASCADE DELETE/UPDATE)
users.id ←───────── goals.user_id                   (CASCADE DELETE/UPDATE)
users.id ←───────── cash_wallet.user_id             (CASCADE DELETE/UPDATE)
users.id ←───────── cash_wallet_logs.user_id        (CASCADE DELETE/UPDATE)
users.id ←───────── notifications.user_id           (CASCADE DELETE/UPDATE)
users.id ←───────── audit_logs.user_id              (SET NULL ON DELETE)

categories.id ←──── transactions.category_id        (RESTRICT DELETE, CASCADE UPDATE)
categories.id ←──── bills.category_id               (RESTRICT DELETE, CASCADE UPDATE)

bills.id ←────────── bill_payments.bill_id          (CASCADE DELETE/UPDATE)

transactions.id ←─── cash_wallet_logs.auto_tx_id    (SET NULL ON DELETE)
```

**Ghi chú quan trọng:**

- `ON DELETE CASCADE` → xóa user sẽ xóa tất cả data liên quan (GDPR compliant)
- `ON DELETE RESTRICT` (categories) → không cho xóa category đang được dùng
- `ON DELETE SET NULL` (audit_logs.user_id) → giữ log kể cả khi user bị xóa

---

## SEED DATA

```sql
-- =====================================================
-- SEED DATA — Chạy sau khi CREATE TABLE
-- =====================================================

-- System Categories (user_id = NULL, global cho tất cả users)
INSERT INTO categories (id, user_id, name, type, icon, color, is_default, sort_order) VALUES
(1,  NULL, 'Thu Nhập',   'income',  '💰', '#10B981', 1, 1),
(2,  NULL, 'Ăn Uống',    'expense', '🍔', '#F59E0B', 1, 2),
(3,  NULL, 'Đồ Uống',    'expense', '🥤', '#3B82F6', 1, 3),
(4,  NULL, 'Di Chuyển',  'expense', '🚗', '#EAB308', 1, 4),
(5,  NULL, 'Nhà Ở',      'expense', '🏠', '#8B5CF6', 1, 5),
(6,  NULL, 'Tiết Kiệm',  'expense', '🏦', '#10B981', 1, 6),
(7,  NULL, 'Giải Trí',   'expense', '🎮', '#EC4899', 1, 7),
(8,  NULL, 'Sức Khỏe',   'expense', '⚕️', '#14B8A6', 1, 8),
(9,  NULL, 'Mua Sắm',    'expense', '🛍️', '#F97316', 1, 9),
(10, NULL, 'Giáo Dục',   'expense', '📚', '#6366F1', 1, 10),
(11, NULL, 'Khác',       'expense', '📦', '#6B7280', 1, 99);

-- Demo user (password: Demo@123 | bcrypt hash, cost=12)
INSERT INTO users (id, username, email, password_hash, full_name, avatar_text, is_active, email_verified) VALUES
(1, 'lego_dauvuong', 'lego@gmail.com',
 '$2b$12$examplehashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
 'Hồ Mai lego', 'DT', 1, 1);

-- User settings (thay cho trigger trg_after_user_insert)
-- Thực tế: được tạo bởi initializeNewUser() trong user-service.ts
INSERT INTO user_settings (user_id, monthly_budget, emergency_buffer, income_date, currency, language, timezone)
VALUES (1, 10000000.00, 2000000.00, 5, 'VND', 'vi', 'Asia/Ho_Chi_Minh');

-- Cash wallet (thay cho trigger trg_after_user_insert)
-- Thực tế: được tạo bởi initializeNewUser() trong user-service.ts
INSERT INTO cash_wallet (user_id, balance) VALUES (1, 500000.00);
```

---

## TIDB SERVERLESS — KẾT NỐI & LƯU Ý

### Connection string format

```
# TiDB Serverless HTTP Driver (bắt buộc cho Vercel Edge — không có TCP)
DATABASE_URL=mysql://username:password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/budget_finance?ssl={"rejectUnauthorized":true}
```

### TiDB vs MySQL 8.x — Khác biệt quan trọng

| Tính năng                     | MySQL 8.x | TiDB Serverless | Ghi chú                             |
| ----------------------------- | --------- | --------------- | ----------------------------------- |
| SQL syntax                    | ✅ Đầy đủ | ✅ Tương thích  | TiDB là MySQL-compatible            |
| Foreign Keys                  | ✅        | ✅              | Hỗ trợ đầy đủ                       |
| JSON columns                  | ✅        | ✅              | Hỗ trợ đầy đủ                       |
| CHECK constraints             | ✅        | ✅              | Hỗ trợ từ TiDB 5.x                  |
| ENUM type                     | ✅        | ✅              | Hỗ trợ đầy đủ                       |
| Stored Procedures             | ✅        | ⚠️ Hạn chế      | **Không dùng — vi phạm Clean Arch** |
| Triggers                      | ✅        | ⚠️ Hạn chế      | **Không dùng — vi phạm Clean Arch** |
| Views                         | ✅        | ✅              | **Không dùng — logic ở API layer**  |
| `ON UPDATE CURRENT_TIMESTAMP` | ✅        | ✅              | Hỗ trợ                              |
| HTTP Driver                   | ❌        | ✅              | **Bắt buộc cho Edge Runtime**       |
| Auto-scale                    | ❌        | ✅              | Serverless, không cần config        |
| Cold start                    | N/A       | < 100ms         | HTTP Driver tối ưu cold start       |

### Drizzle Migrations workflow

```bash
# Tại packages/db/
pnpm db:generate   # Generate migration files từ schema changes
pnpm db:migrate    # Apply migrations lên TiDB Serverless
pnpm db:studio     # Mở Drizzle Studio (web UI để inspect data)
```

---

## NAMING CONVENTIONS

| Loại             | Convention                          | Ví dụ                             |
| ---------------- | ----------------------------------- | --------------------------------- |
| Bảng (SQL)       | snake_case, số nhiều                | `users`, `bill_payments`          |
| Cột (SQL)        | snake_case                          | `user_id`, `created_at`           |
| Field (Drizzle)  | camelCase                           | `userId`, `createdAt`             |
| PK               | `id` (SQL) / `id` (Drizzle)         | `id BIGINT UNSIGNED`              |
| FK (SQL)         | `{table_singular}_id`               | `user_id`, `category_id`          |
| Index            | `idx_{table}_{columns}`             | `idx_tx_user_date`                |
| Unique key       | `uq_{table}_{columns}`              | `uq_bill_period`                  |
| FK constraint    | `fk_{table}_{ref_table}`            | `fk_transactions_user`            |
| Check constraint | `chk_{table}_{description}`         | `chk_tx_amount_positive`          |
| ~~Trigger~~      | ~~`trg_{timing}_{table}_{action}`~~ | **ĐÃ XÓA — dùng service layer**   |
| ~~Stored Proc~~  | ~~`sp_{action}`~~                   | **ĐÃ XÓA — dùng service layer**   |
| ~~View~~         | ~~`v_{description}`~~               | **ĐÃ XÓA — dùng query functions** |

## DATA TYPES REFERENCE

| Dữ liệu     | SQL Type            | Drizzle Type                                 | Ghi chú                                                                                    |
| ----------- | ------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ID chính    | `BIGINT UNSIGNED`   | `bigint({ mode: "string", unsigned: true })` | **[FIX #4] mode:"string" — bắt buộc với TiDB Serverless**                                  |
| Category ID | `INT UNSIGNED`      | `int({ unsigned: true })`                    | Nhỏ hơn, đủ cho ~1000 categories; int không bị overflow                                    |
| Tiền tệ     | `DECIMAL(15,2)`     | `decimal({ precision: 15, scale: 2 })`       | `amount`, `balance` — **Decimal Trap:** đọc từ DB là string, không `.toNumber()` trực tiếp |
| ~~Tỷ giá~~  | ~~`DECIMAL(18,6)`~~ | ~~`decimal({ precision: 18, scale: 6 })`~~   | **Phase 2** — multi-currency. MVP = VND-only, không cần.                                   |
| Tỷ lệ %     | `DECIMAL(5,2)`      | `decimal({ precision: 5, scale: 2 })`        | Max: 999.99%                                                                               |
| Tên/Label   | `VARCHAR(50–255)`   | `varchar({ length: N })`                     | Tuỳ độ dài                                                                                 |
| URL         | `VARCHAR(500)`      | `varchar({ length: 500 })`                   | Link ảnh, action URLs                                                                      |
| Password    | `VARCHAR(255)`      | `varchar({ length: 255 })`                   | bcrypt hash (60 chars)                                                                     |
| Emoji       | `VARCHAR(20)`       | `varchar({ length: 20 })`                    | utf8mb4 hỗ trợ emoji                                                                       |
| Hex color   | `VARCHAR(7)`        | `varchar({ length: 7 })`                     | `#RRGGBB`                                                                                  |
| Tháng kỳ    | `CHAR(7)`           | `char({ length: 7 })`                        | `YYYY-MM`, vd: `2026-03`                                                                   |
| Ngày sổ cái | `DATE`              | `date()`                                     | **[v12.0-A]** `display_date` — ngày user chọn. Không timezone confusion.                   |
| Timestamps  | `TIMESTAMP`         | `timestamp()`                                | UTC storage — `created_at`, `updated_at`, `paid_at`                                        |
| Flags       | `TINYINT(1)`        | `tinyint()`                                  | 0/1 boolean                                                                                |
| JSON data   | `JSON`              | `json()`                                     | TiDB native JSON                                                                           |
| Enum        | `ENUM(...)`         | `mysqlEnum(...)`                             | Constrained string values                                                                  |
