# Database Entity-Relationship Diagram (ERD)

Dưới đây là sơ đồ thực thể liên kết (ERD) được kết xuất từ các tệp Drizzle Schema. Bạn có thể sử dụng các công cụ hỗ trợ Markdown có Mermaid (như GitHub, Notion, Obsidian) để xem bản vẽ trực quan.

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar username
        varchar email
        varchar passwordHash
        varchar fullName
        varchar avatarUrl
        boolean isActive
        timestamp createdAt
        timestamp deletedAt
    }

    CATEGORIES {
        bigint id PK
        bigint userId FK
        varchar name
        varchar type "income | expense | both"
        varchar icon
        varchar color
        boolean isSystem
        bigint parentId FK
    }

    WALLETS {
        bigint id PK
        bigint userId FK
        varchar name
        varchar type "cash | bank | e_wallet"
        decimal balance
        boolean isDefault
    }

    TRANSACTIONS {
        bigint id PK
        bigint userId FK
        bigint categoryId FK
        bigint walletId FK
        varchar type "income | expense | transfer"
        decimal amount
        text description
        date displayDate
        varchar idempotencyKey
    }

    BUDGETS {
        bigint id PK
        bigint userId FK
        bigint categoryId FK
        decimal amount
        varchar period "monthly | weekly"
        date startDate
        date endDate
    }

    GOALS {
        bigint id PK
        bigint userId FK
        varchar name
        decimal targetAmount
        decimal currentAmount
        date deadline
        varchar status "active | completed"
    }

    BILLS {
        bigint id PK
        bigint userId FK
        bigint categoryId FK
        varchar name
        decimal amount
        date dueDate
        varchar frequency
        boolean isPaid
        boolean autoPay
    }

    %% Relationships
    USERS ||--o{ CATEGORIES : "creates"
    USERS ||--o{ WALLETS : "owns"
    USERS ||--o{ TRANSACTIONS : "makes"
    USERS ||--o{ BUDGETS : "sets"
    USERS ||--o{ GOALS : "targets"
    USERS ||--o{ BILLS : "must_pay"

    CATEGORIES ||--o{ TRANSACTIONS : "categorizes"
    CATEGORIES ||--o{ BUDGETS : "has_budget"
    CATEGORIES ||--o{ BILLS : "categorizes"

    WALLETS ||--o{ TRANSACTIONS : "funds"
```

## Giải thích Luồng Dữ Liệu:
1. **Users** là trung tâm. Mọi bảng khác đều trỏ về `userId` để đảm bảo data scoping (Cách ly dữ liệu người dùng).
2. **Categories** là bảng từ điển trung tâm (Dictionary Table) kết nối cả `Transactions`, `Budgets` và `Bills`. Điều này giúp ứng dụng có thể tính toán ngân sách (Budget) dựa trên việc đối chiếu (JOIN) với các Giao dịch (Transactions) có chung `categoryId`.
3. **Wallets** là nơi dòng tiền thực tế dịch chuyển. Bất kỳ `Transaction` nào mang tính chất `income` hoặc `expense` đều làm thay đổi `balance` của `Wallets` tương ứng.
4. Hệ thống **không dùng DELETE cứng**. Mọi bảng đều có trường `deletedAt` để áp dụng Soft-Delete.
