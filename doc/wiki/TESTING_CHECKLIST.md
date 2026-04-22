# ✅ TESTING CHECKLIST

Checklist để kiểm tra sau khi migration hoàn thành.

---

## 🚀 PHASE 1: Setup & Installation

### 1. Dependencies
```bash
- [ ] Run: npm install
- [ ] Check: No error messages
- [ ] Verify: node_modules/ created
```

### 2. Development Server
```bash
- [ ] Run: npm run dev
- [ ] Check: Server starts on http://localhost:3000
- [ ] Verify: No compilation errors
- [ ] Check: Hot reload works
```

---

## 🔐 PHASE 2: Authentication Pages

### Login Page (`/login`)
```
- [ ] Navigate to http://localhost:3000
- [ ] Should redirect to /login
- [ ] Check: Page renders correctly
- [ ] Check: Logo displays
- [ ] Check: Form inputs work
- [ ] Check: Password toggle (eye icon) works
- [ ] Check: "Remember me" checkbox works
- [ ] Test: Click "Đăng Nhập" button
- [ ] Verify: Redirects to dashboard (/)
- [ ] Check: "Đăng ký ngay" link works
```

### Register Page (`/register`)
```
- [ ] Navigate to /register
- [ ] Check: Page renders correctly
- [ ] Check: All form fields display
- [ ] Check: Full name input works
- [ ] Check: Username input works
- [ ] Check: Email input works
- [ ] Check: Password input works
- [ ] Check: Password toggle works
- [ ] Test: Click "Đăng Ký" button
- [ ] Verify: Redirects to /login
- [ ] Check: "Đăng nhập ngay" link works
```

---

## 🏠 PHASE 3: Dashboard Layout

### Sidebar
```
- [ ] After login, check sidebar appears
- [ ] Check: Logo renders correctly
- [ ] Check: All nav items display:
    - [ ] Tổng Quan (Dashboard icon)
    - [ ] Giao Dịch (ListOrdered icon)
    - [ ] Mục Tiêu (Target icon)
    - [ ] Hóa Đơn (Receipt icon)
    - [ ] Phân Tích (BarChart3 icon)
    - [ ] Cài Đặt (Settings icon)
- [ ] Test: Click toggle button (ChevronLeft)
- [ ] Verify: Sidebar collapses/expands
- [ ] Test: Click each nav item
- [ ] Verify: Active state highlights correctly
- [ ] Check: Đăng Xuất button works
- [ ] Verify: Redirects to /login
```

### Header
```
- [ ] Check: Header displays at top
- [ ] Check: Greeting message shows
- [ ] Check: User name displays
- [ ] Check: Search icon works
- [ ] Test: Click search icon
- [ ] Verify: Search input expands
- [ ] Check: Notification bell shows
- [ ] Check: Red badge appears on bell
- [ ] Check: "Thêm Giao Dịch" button displays
- [ ] Check: User avatar shows
```

---

## 📊 PHASE 4: Dashboard Pages

### Main Dashboard (`/`)
```
- [ ] Navigate to /
- [ ] Check: S2S Hero Section renders
- [ ] Check: Safe-to-spend amount displays
- [ ] Check: Period tabs work (Ngày/Tuần/Tháng)
- [ ] Check: Animations smooth
- [ ] Check: Cash Wallet Strip displays
- [ ] Check: Quick Input Bar renders
- [ ] Test: Type amount in input
- [ ] Test: Select category pill
- [ ] Test: Click "Lưu" button
- [ ] Verify: Shows "Đã lưu!" feedback
- [ ] Check: All metric cards display
```

### Transactions Page (`/transactions`)
```
- [ ] Navigate to /transactions
- [ ] Check: Page title shows
- [ ] Check: Transaction list renders
- [ ] Check: Filters work
- [ ] Check: Search works (if implemented)
- [ ] Check: Pagination works (if implemented)
```

### Goals Page (`/goals`)
```
- [ ] Navigate to /goals
- [ ] Check: Page renders correctly
- [ ] Check: Goal cards display
- [ ] Check: Progress bars show
- [ ] Check: Add goal button works
```

### Bills Page (`/bills`)
```
- [ ] Navigate to /bills
- [ ] Check: Page renders correctly
- [ ] Check: Bill list displays
- [ ] Check: Status indicators work
- [ ] Check: Due date highlights
```

### Analytics Page (`/analytics`)
```
- [ ] Navigate to /analytics
- [ ] Check: Page renders correctly
- [ ] Check: Charts display (Recharts)
- [ ] Check: Date range picker works
- [ ] Check: Category breakdown shows
```

### Settings Page (`/settings`)
```
- [ ] Navigate to /settings
- [ ] Check: Page renders correctly
- [ ] Check: Settings sections display
- [ ] Check: Toggle switches work
- [ ] Check: Save button works
```

---

## 🎨 PHASE 5: Components

### Quick Input Bar
```
- [ ] Check: Displays on dashboard
- [ ] Test: Type amount (auto-formats with commas)
- [ ] Test: Type note
- [ ] Test: Select category pill
- [ ] Verify: Selected category highlights
- [ ] Test: Click "Lưu" without category
- [ ] Verify: Warning message shows
- [ ] Test: Click "Lưu" with all fields
- [ ] Verify: Shows success animation
- [ ] Verify: Form resets after save
```

### Chat Quick Add (if activated)
```
- [ ] Test: Click "Thêm Giao Dịch" in header
- [ ] Check: Modal opens
- [ ] Check: Suggestions display
- [ ] Test: Click suggestion
- [ ] Verify: Input populates
- [ ] Test: Type "Ăn sáng 30k"
- [ ] Verify: AI parses correctly
- [ ] Check: Preview shows amount, category, note
- [ ] Test: Click "Thêm"
- [ ] Verify: Modal closes
```

### S2S Hero Section
```
- [ ] Check: Displays prominently
- [ ] Check: Amount animates on load
- [ ] Check: Gradient background renders
- [ ] Test: Click period tabs
- [ ] Verify: Amount updates
- [ ] Check: Sub-metrics display
- [ ] Check: Icons show correctly
```

### Cash Wallet Strip
```
- [ ] Check: Displays below S2S
- [ ] Check: Current balance shows
- [ ] Check: Incoming/Outgoing amounts
- [ ] Check: Quick actions available
```

---

## 🎭 PHASE 6: Animations & Interactions

### Page Transitions
```
- [ ] Test: Navigate between pages
- [ ] Check: No flash of unstyled content
- [ ] Check: Smooth transitions
```

### Button Interactions
```
- [ ] Test: Hover over buttons
- [ ] Check: Hover states work
- [ ] Test: Click buttons
- [ ] Check: Active/pressed states
- [ ] Check: Motion animations smooth
```

### Modal Animations
```
- [ ] Test: Open quick add modal
- [ ] Check: Backdrop fades in
- [ ] Check: Modal scales in
- [ ] Test: Close modal (X button)
- [ ] Check: Modal scales out
- [ ] Test: Close modal (backdrop click)
- [ ] Check: Modal closes
```

---

## 📱 PHASE 7: Responsive Design

### Mobile View (< 768px)
```
- [ ] Resize to mobile
- [ ] Check: Sidebar hides automatically
- [ ] Check: Mobile menu button appears
- [ ] Test: Click mobile menu
- [ ] Verify: Sidebar opens
- [ ] Check: Header adapts
- [ ] Check: Quick add button adapts
- [ ] Check: Components stack vertically
```

### Tablet View (768px - 1024px)
```
- [ ] Resize to tablet
- [ ] Check: Layout adapts
- [ ] Check: Sidebar shows (narrow)
- [ ] Check: Content responsive
```

### Desktop View (> 1024px)
```
- [ ] Resize to desktop
- [ ] Check: Full layout displays
- [ ] Check: Sidebar expanded by default
- [ ] Check: Content uses full width
```

---

## 🔧 PHASE 8: Browser Testing

### Chrome/Edge
```
- [ ] Test all features
- [ ] Check: No console errors
- [ ] Check: Animations smooth
```

### Firefox
```
- [ ] Test all features
- [ ] Check: No console errors
- [ ] Check: Rendering correct
```

### Safari (if available)
```
- [ ] Test all features
- [ ] Check: No console errors
- [ ] Check: Webkit compatibility
```

---

## 🏗️ PHASE 9: Build & Production

### Build Test
```bash
- [ ] Run: npm run build
- [ ] Check: Build completes without errors
- [ ] Check: No TypeScript errors
- [ ] Check: No ESLint errors
- [ ] Check: Build output in /.next/
```

### Production Server
```bash
- [ ] Run: npm run start
- [ ] Check: Server starts
- [ ] Navigate to http://localhost:3000
- [ ] Test: All features work in production
- [ ] Check: Performance is good
- [ ] Check: No console errors
```

---

## 🐛 PHASE 10: Error Handling

### Network Errors
```
- [ ] Disconnect internet
- [ ] Test: Try to submit form
- [ ] Check: Graceful error handling
```

### Invalid Inputs
```
- [ ] Test: Submit empty form
- [ ] Check: Validation messages
- [ ] Test: Invalid email format
- [ ] Check: Error states
```

---

## ✅ FINAL VERIFICATION

### Code Quality
```
- [ ] No console.log() statements left
- [ ] No unused imports
- [ ] No commented code blocks
- [ ] TypeScript strict mode passed
```

### Performance
```
- [ ] Initial page load < 2s
- [ ] Navigation feels instant
- [ ] Animations smooth (60fps)
- [ ] No memory leaks
```

### Accessibility
```
- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast sufficient
```

---

## 📊 TESTING RESULTS

**Date Tested:** ___________  
**Tester:** ___________  
**Browser:** ___________  
**Device:** ___________

**Total Tests:** ~120  
**Passed:** _____ / 120  
**Failed:** _____ / 120  
**Pass Rate:** _____% 

---

## 🚨 ISSUES FOUND

| Issue | Severity | Page | Status |
|-------|----------|------|--------|
| Example: Button not clickable | High | /login | 🔴 Open |
| | | | |

---

## ✅ SIGN-OFF

- [ ] All critical features work
- [ ] No blocking bugs
- [ ] Performance acceptable
- [ ] Ready for backend integration

**Signed:** ___________  
**Date:** ___________

---

**Testing Complete!** 🎉
