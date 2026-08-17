# 🧪 Camproxi Student Portal – Route-by-Route Test Suite & QA Guide

This guide details all functional, integration, real-time, and edge-case test procedures to execute for every route in the **Camproxi Student Portal**.

---

## 1. Onboarding (`/onboarding`)

### 📋 Overview
Initial walkthrough screen for new users explaining the platform value proposition (Lodges, Food, Services).

### 🧪 Test Cases
- [ ] **Slide Navigation**: Swipe or click next/prev controls to ensure smooth transitions between onboarding slides.
- [ ] **Skip Onboarding**: Click the "Skip" button and verify redirection to `/login` or `/home`.
- [ ] **Get Started**: Complete all slides and click "Get Started". Verify user state is saved in `localStorage` (`camproxi_onboarded`) so onboarding is skipped on future visits.

---

## 2. Authentication (`/login`)

### 📋 Overview
User authentication including student sign-in, account registration, email/username validation, and campus selection.

### 🧪 Test Cases
- [ ] **Login with Valid Credentials**: Enter registered student email/username & password. Verify successful authentication, JWT cookie/token storage, and redirection to `/home`.
- [ ] **Login with Invalid Credentials**: Test incorrect password or non-existent email. Verify error toast/message is displayed without crashing.
- [ ] **Account Creation (Register)**:
  - Select target University Campus (e.g. FUTO, UNILAG).
  - Test real-time email check (`GET /api/student/auth/email/:email`) and username availability check (`GET /api/student/auth/username/:username`).
  - Submit sign-up form. Verify new user record is created (`POST /api/student/auth/create`) and user is logged in automatically.
- [ ] **Logout Flow**: Click "Log out" from Profile or Settings. Verify JWT/cookies/localStorage are wiped and app redirects to `/login`.

---

## 3. Home Dashboard (`/home`)

### 📋 Overview
Main feed displaying campus-specific hero banners, category chips, featured lodges/products/services, and quick actions.

### 🧪 Test Cases
- [ ] **Campus Context**: Verify featured listings match the student's selected campus school ID.
- [ ] **Search Bar Input**: Type search terms into the top search bar and press Enter or click search; verify transition to `/explore?q=...`.
- [ ] **Category Quick Filters**: Click on "Lodges", "Products", or "Services" chips. Verify grid updates to filter by that category.
- [ ] **Listing Card Click**: Click any property/product card. Verify routing to `/listing/:id`.
- [ ] **Save/Wishlist Toggle**: Click the heart icon on any card. Verify state toggles and `saveItem` / `removeSavedItem` API requests succeed.

---

## 4. Explore Marketplace (`/explore`)

### 📋 Overview
Full searchable and filterable directory of all properties, products, and services.

### 🧪 Test Cases
- [ ] **Tabs Switching**: Switch between **All**, **Lodges**, **Products**, and **Services** tabs. Verify items re-render correctly.
- [ ] **Search Filtering**: Test search query filtering by item title, description, or location.
- [ ] **Price Range & Sort Filter**: Apply min/max price range or sorting (Price Low-to-High / High-to-Low). Verify correct item ordering.
- [ ] **Empty Search State**: Search for a non-existent item (e.g. `xyz123`). Verify "No listings found" empty state is displayed gracefully.

---

## 5. Listing Detail Page (`/listing/:id`)

### 📋 Overview
Detailed item view showing gallery carousel, price, specifications, agent contact button, ratings/reviews, and request forms.

### 🧪 Test Cases
- [ ] **Gallery Preview**: Click image thumbnails or swipe through image carousel. Click an image to test full-screen modal view.
- [ ] **Agent Card & Profile Link**: Verify agent name, badge, and avatar are loaded (`GET /api/student/users/agent/:id`). Click agent profile to navigate to `/agent/:id`.
- [ ] **Initiate Chat Button**: Click "Chat with Agent". Verify chat initiation (`POST /api/student/chats/initiate`) and redirection to `/messages?chatId=...`.
- [ ] **Submit Property/Product Request**: Click "Request Item" or "Schedule Inspection". Verify request submission (`POST /api/student/requests`).
- [ ] **Submit Star Rating**: Click star icons (1 to 5) to rate the item (`POST /api/student/ratings`). Verify aggregate rating score updates.
- [ ] **Submit Review Comment**: Write a comment and click Submit (`POST /api/student/reviews`). Verify comment appears in the review list.
- [ ] **Delete Own Review**: If logged in as the comment author, verify the red trash icon appears. Click it and confirm review is deleted (`DELETE /api/student/reviews/:id`).
- [ ] **Report Item**: Click the "Report" button in the header. Select reason, write message, and submit (`POST /api/student/reports`). Verify success toast.

---

## 6. Agent Public Profile (`/agent/:id`)

### 📋 Overview
Public profile page for verified agents showing business details, bio, campus affiliation, and active listings portfolio.

### 🧪 Test Cases
- [ ] **Agent Info Verification**: Verify agent name, business name, joined date, and campus name load correctly.
- [ ] **Agent Listings Portfolio**: Verify all properties, products, and services owned by this agent ID are displayed.
- [ ] **Report Agent**: Click the "Report Agent" button. Verify `ReportModal` opens with `targetType: 'AGENT'` and pre-filled agent name. Submit report and verify confirmation.

---

## 7. Saved Wishlist (`/saved`)

### 📋 Overview
Wishlist page displaying all items saved by the student.

### 🧪 Test Cases
- [ ] **Saved List Rendering**: Verify all items saved via heart buttons appear here (`GET /api/student/saved`).
- [ ] **Remove Single Saved Item**: Click heart/bookmark on a saved item card. Verify item is removed from wishlist (`DELETE /api/student/saved/:id`).
- [ ] **Clear All Saved Items**: Click "Clear all" button in header. Confirm prompt dialog. Verify all saved items are wiped (`DELETE /api/student/saved`) and empty state is rendered.

---

## 8. Activity & Requests (`/activity`)

### 📋 Overview
Timeline tracking interest requests and inspection requests submitted by the student to agents.

### 🧪 Test Cases
- [ ] **Requests Timeline**: Verify list of active requests loads (`GET /api/student/requests`).
- [ ] **Status Badges**: Verify request status badges (`Pending`, `Approved`, `Contacted`) display correct color indicators.
- [ ] **Contact Agent Action**: Click "Contact Agent" on a request card. Verify routing to the active chat room in `/messages`.

---

## 9. Real-Time Chat & Messages (`/messages`)

### 📋 Overview
WebSocket-powered real-time chat interface for messaging agents.

### 🧪 Test Cases
- [ ] **Chat List Preview**: Verify all chat rooms load (`GET /api/student/chats`) with agent name, avatar, and last message snippet.
- [ ] **Sidebar Search Filter**: Type in the search box. Verify chats filter dynamically by agent name, company name, or message content.
- [ ] **Real-Time Send Message**: Open a chat, type a message, and click Send. Verify:
  - Immediate optimistic UI append.
  - WebSocket emission (`sendMessage`).
  - Chat room moves to top of sidebar.
- [ ] **Real-Time Receive Message**: Send a message from an agent test account. Verify `newMessage` WebSocket event delivers message instantly without page refresh.
- [ ] **Read Receipts**: Open an unread chat. Verify `markChatRead` API call and socket emission updates unread counts to 0.
- [ ] **Delete Message**: Hover over your own sent message bubble, click the dropdown chevron, and click "Delete". Verify message is deleted instantly (`deleteMessage` socket event).
- [ ] **Report User in Chat**: Click three-dots menu in chat header and select "Report user". Verify report modal opens with `targetType: 'AGENT'`.

---

## 10. Notifications (`/notifications`)

### 📋 Overview
Real-time notification center for alerts, request updates, and system announcements.

### 🧪 Test Cases
- [ ] **List Notifications**: Verify notifications load (`GET /api/student/notifications`).
- [ ] **Mark Single Read**: Click an unread notification card. Verify status updates to read (`PATCH /api/student/notifications/:id/read`).
- [ ] **Mark All Read**: Click "Mark all as read" button. Verify all badges reset (`PATCH /api/student/notifications/read-all`).
- [ ] **Real-Time Notification Delivery**: Trigger a backend notification; verify WebSocket `newNotification` event updates notification badge in header in real time.

---

## 11. Student Profile (`/profile`)

### 📋 Overview
Student overview card displaying avatar, school/campus name, email, stats (saved items count, requests count), and quick navigation menu.

### 🧪 Test Cases
- [ ] **Profile Info Loading**: Verify student full name, email, avatar initial/gradient, and school name load (`GET /api/student/users/me`).
- [ ] **Stats Counter Accuracy**: Verify "Saved Items" count matches `/saved` total and "Active Requests" count matches `/activity` total.
- [ ] **Quick Menu Routing**: Test clicking "Edit profile", "Settings", "Verification", and "Help & support" menu items to verify correct query routing to `/settings?v=...`.

---

## 12. Settings & Sub-Views (`/settings`)

### 📋 Overview
Central settings portal with tabbed views for profile editing, feedback, privacy, verification, and support.

### 🧪 Sub-View Test Cases

#### A. Edit Profile (`/settings?v=editProfile`)
- [ ] **Update Info**: Change first name, last name, or phone number. Click "Save changes" (`PATCH /api/student/profile/update`). Verify user data updates across header and profile.

#### B. My Reviews (`/settings?v=reviews`)
- [ ] **View Written Reviews**: Verify list of submitted review comments (`GET /api/student/reviews/me`).
- [ ] **View Star Ratings**: Verify list of submitted star ratings (`GET /api/student/ratings/me`).
- [ ] **Delete Review / Rating**: Click delete icon on any review or rating. Confirm item is deleted and list refetches.

#### C. Notifications Settings (`/settings?v=notifications`)
- [ ] **Toggle Push/Email Notifications**: Toggle notification switches. Verify setting updates (`PATCH /api/student/profile/update`).

#### D. Privacy & Security (`/settings?v=privacy`)
- [ ] **Toggle Visibility / Location**: Toggle "Location services" or "Show activity status" switches. Verify state is saved in context.

#### E. Verification (`/settings?v=verification`)
- [ ] **Send Email OTP**: Click "Send OTP" for email verification (`POST /api/student/profile/send-verification`).
- [ ] **Verify Email OTP**: Enter 6-digit OTP code (`POST /api/student/profile/verify-email`). Verify "Verified ✓" badge appears.
- [ ] **Send & Verify Phone SMS OTP**: Test phone OTP send and verification (`POST /profile/send-phone-verification` & `/profile/verify-phone`).

#### F. My Reports (`/settings?v=reports`)
- [ ] **Reports History**: Verify submitted reports list (`GET /api/student/reports`).
- [ ] **Status Badges**: Verify `Under Review` (Amber) vs `Resolved` (Emerald) status indicators.
- [ ] **Admin Responses**: Verify admin reply box is displayed when `report.reply` exists.
- [ ] **New Report Button**: Click "New Report" button; verify `ReportModal` opens smoothly.

#### G. Help & Support (`/settings?v=help`)
- [ ] **Accordion FAQ**: Click FAQ items to expand/collapse answers.
- [ ] **Report Problem Button**: Click "Report a problem" to trigger general report modal.

---

## 📌 Test Execution Summary Matrix

| Route | Main Endpoints Tested | Real-Time / Socket Test |
|---|---|---|
| `/login` | `POST /auth/login`, `POST /auth/create` | ❌ |
| `/home` | `GET /items/*`, `GET /users/me` | ❌ |
| `/explore` | `GET /items/products`, `/properties`, `/services` | ❌ |
| `/listing/:id` | `GET /items/*/:id`, `POST /ratings`, `POST /reviews`, `DELETE /reviews/:id` | ❌ |
| `/saved` | `GET /saved`, `DELETE /saved/:id`, `DELETE /saved` | ❌ |
| `/messages` | `GET /chats`, `GET /chats/:id/messages`, `PATCH /chats/:id/read` | `sendMessage`, `newMessage`, `deleteMessage`, `markAsRead` |
| `/notifications` | `GET /notifications`, `PATCH /notifications/read-all` | `newNotification`, `notificationRead` |
| `/settings` | `PATCH /profile/update`, `POST /verify-email`, `GET /reports` | ❌ |
