erDiagram
USERS {
bigint id PK
varchar username UK
varchar email UK
varchar passwordHash
varchar firebaseUid UK
varchar fullName
varchar avatarUrl
varchar avatarText
tinyint isActive
tinyint emailVerified
timestamp lastLoginAt
timestamp deletedAt
timestamp createdAt
timestamp updatedAt
}

    USER_SETTINGS {
        bigint userId PK
        decimal monthlyBudget
        decimal emergencyBuffer
        tinyint incomeDate
        varchar currency
        varchar language
        varchar timezone
        enum theme
        tinyint notifyBillBeforeDays
        decimal notifyBudgetThreshold
        tinyint notifyEmail
        tinyint notifyPush
        timestamp createdAt
        timestamp updatedAt
    }

    WALLETS {
        bigint id PK
        bigint userId FK
        varchar name
        varchar type
        decimal balance
        decimal initialBalance
        varchar icon
        varchar color
        tinyint isDefault
        timestamp deletedAt
        timestamp createdAt
        timestamp updatedAt
    }

    WALLET_LOGS {
        bigint id PK
        bigint walletId FK
        bigint userId FK
        bigint transactionId FK
        decimal balanceBefore
        decimal balanceAfter
        decimal difference
        varchar note
        timestamp createdAt
    }

    CATEGORIES {
        int id PK
        bigint userId FK
        varchar name
        enum type
        varchar icon
        varchar color
        tinyint isDefault
        int sortOrder
        timestamp createdAt
        timestamp updatedAt
    }

    TRANSACTIONS {
        bigint id PK
        bigint userId FK
        bigint walletId FK
        int categoryId FK
        bigint goalId FK
        decimal amount
        enum type
        varchar note
        date displayDate
        varchar receiptUrl
        enum source
        varchar idempotencyKey UK
        timestamp createdAt
        timestamp updatedAt
    }

    BILLS {
        bigint id PK
        bigint userId FK
        int categoryId FK
        varchar name
        varchar icon
        decimal amount
        tinyint dueDay
        enum frequency
        tinyint autoPay
        tinyint isActive
        text notes
        varchar idempotencyKey UK
        timestamp createdAt
        timestamp updatedAt
    }

    BILL_PAYMENTS {
        bigint id PK
        bigint billId FK
        bigint userId FK
        bigint transactionId FK
        char periodMonth
        decimal amountPaid
        timestamp paidAt
        varchar note
        timestamp createdAt
    }

    GOALS {
        bigint id PK
        bigint userId FK
        varchar name
        varchar icon
        decimal targetAmount
        decimal currentSaved
        decimal monthlyContribution
        date deadline
        enum status
        tinyint priority
        text notes
        timestamp completedAt
        varchar idempotencyKey UK
        timestamp createdAt
        timestamp updatedAt
    }

    BUDGETS {
        bigint id PK
        bigint userId FK
        varchar name
        varchar icon
        decimal targetAmount
        enum periodType
        date startDate
        date endDate
        tinyint isAllCategories
        enum walletScope
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    BUDGET_CATEGORIES {
        bigint id PK
        bigint budgetId FK
        int categoryId FK
        decimal allocatedAmount
    }

    NOTIFICATIONS {
        bigint id PK
        bigint userId FK
        enum type
        varchar title
        text body
        varchar icon
        varchar actionUrl
        tinyint isRead
        timestamp readAt
        timestamp expiresAt
        json metadata
        timestamp createdAt
    }

    REFRESH_TOKENS {
        bigint id PK
        bigint userId FK
        varchar tokenHash UK
        varchar deviceInfo
        varchar ipAddress
        timestamp expiresAt
        timestamp revokedAt
        timestamp createdAt
    }

    %% Relationships
    USERS ||--|| USER_SETTINGS : configures
    USERS ||--o{ WALLETS : owns
    USERS ||--o{ WALLET_LOGS : has
    USERS ||--o{ CATEGORIES : creates
    USERS ||--o{ TRANSACTIONS : makes
    USERS ||--o{ BILLS : has
    USERS ||--o{ BILL_PAYMENTS : makes
    USERS ||--o{ GOALS : targets
    USERS ||--o{ BUDGETS : sets
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ REFRESH_TOKENS : has

    WALLETS ||--o{ TRANSACTIONS : funds
    WALLETS ||--o{ WALLET_LOGS : logs
    WALLET_LOGS ||--o| TRANSACTIONS : tracks

    CATEGORIES ||--o{ TRANSACTIONS : categorizes
    CATEGORIES ||--o{ BILLS : categorizes
    CATEGORIES ||--o{ BUDGET_CATEGORIES : linked

    GOALS ||--o{ TRANSACTIONS : contributions

    BILLS ||--o{ BILL_PAYMENTS : paid_by
    BILL_PAYMENTS ||--o| TRANSACTIONS : links

    BUDGETS ||--o{ BUDGET_CATEGORIES : has
