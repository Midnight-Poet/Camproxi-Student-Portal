# Camproxi — Student Portal API Documentation

> All protected routes require the `access_token` **HttpOnly cookie** (JWT, 1 h TTL).  
> The JWT payload contains at minimum: `sub` (student ID) and `schoolId`.  
> Cookie flags: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` in PROD.

---

## 1. Authentication
**Base Route:** `POST|GET /api/student/auth`  
**Guard:** Public (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/student/auth/login` | Authenticate and set `access_token` cookie |
| `POST` | `/api/student/auth/create` | Register a new student, sets `access_token` cookie. Requires `campusName` in body. |
| `POST` | `/api/student/auth/logout` | Clear the `access_token` cookie |
| `GET` | `/api/student/auth/email/:email` | Check whether an email is already taken |
| `GET` | `/api/student/auth/username/:username` | Check whether a username is already taken |

---

## 2. Profile Management
**Base Route:** `/api/student/profile`  
**Guard:** `StudentAuthGuard`

### `PATCH /api/student/profile/update`
**Body (`UpdateProfileDto`):** All fields are optional. Extends `CreateUserDto` but **omits** `password`, `school`, and `location`.

### `POST /api/student/profile/send-verification`
Sends a 6-digit OTP to the student's email.

### `POST /api/student/profile/verify-email`
**Body:** `{ "otp": "string" }`
Verifies the email. 

### `POST /api/student/profile/send-phone-verification`
Sends a 6-digit OTP to the student's phone via SMS (Termii).

### `POST /api/student/profile/verify-phone`
**Body:** `{ "otp": "string" }`
Verifies the phone number.

> [!NOTE]  
> The student's `isverified` flag will only be set to `true` when BOTH `emailVerified` and `phoneVerified` are strictly true.

---

## 3. Users Directory
**Base Route:** `/api/student/users`  
**Guard:** `StudentAuthGuard`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/student/users/me` | Get own profile |
| `GET` | `/api/student/users/:id` | Get any student's profile by ID |
| `GET` | `/api/student/users/agent/:id` | Get any agent's public profile by ID |

### Profile Response
When fetching a profile (e.g., `/api/student/users/me`), the user object includes the populated `school` field. Note that schools now use the `code` and `campus` structure:
```json
{
  "id": "ObjectId",
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "email": "string",
  "schoolId": "ObjectId",
  "school": {
    "id": "ObjectId",
    "name": "string",
    "code": "string (e.g., 'FUTMINNA')",
    "campus": [
      {
        "name": "string",
        "location": { "latitude": "number", "longitude": "number" }
      }
    ]
  },
  "bio": "string",
  "profileImage": { "url": "string", "public_id": "string" }
}
```

---

## 4. Saved Items (Wishlist / Bookmarks)
**Base Route:** `/api/student/saved`  
**Guard:** `StudentAuthGuard`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/student/saved` | Save an item to the wishlist |
| `GET` | `/api/student/saved` | List all saved items |
| `GET` | `/api/student/saved/:id` | Get a single saved-item record by its ID |
| `DELETE` | `/api/student/saved/:id` | Remove a specific saved-item record |
| `DELETE` | `/api/student/saved` | Clear the entire wishlist |

---

## 5. Marketplace Items
**Base Route:** `/api/student/items`  
**Guard:** `StudentAuthGuard`  
All queries are automatically scoped to the school from the JWT.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/student/items/products` | List all products |
| `GET` | `/api/student/items/products/:id` | Get a product + its reviews & ratings |
| `GET` | `/api/student/items/properties` | List all properties |
| `GET` | `/api/student/items/properties/:id` | Get a property + its reviews & ratings |
| `GET` | `/api/student/items/services` | List all services |
| `GET` | `/api/student/items/services/:id` | Get a service + its reviews & ratings |

### Expected Item Response
When fetching an item, expect it to include its base fields along with `images` array, `agent` (owner), and optionally `reviews` and `ratings` depending on the route.
```json
{
  "id": "ObjectId",
  "name": "string",
  "description": "string",
  "price": "number",
  "isAvailable": "boolean",
  "status": "string",
  "averageRating": "number",
  "totalReviews": "number",
  "agentId": "ObjectId",
  "schoolId": "ObjectId",
  "createdAt": "DateTime",
  "updatedAt": "DateTime",
  "images": [
    {
      "url": "string",
      "public_id": "string",
      "isCover": "boolean"
    }
  ],
  "agent": {
    "id": "ObjectId",
    "firstName": "string",
    "lastName": "string",
    "companyName": "string",
    "phone": "string",
    "profileImage": { "url": "string", "public_id": "string" }
  }
}
```

---

## 6. Ratings & Reviews
**Base Route:** `/api/student`  
**Guard:** `StudentAuthGuard`  

### Ratings
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/student/ratings` | Submit or update the rating |
| `DELETE`| `/api/student/ratings/:itemId` | Delete your rating for the specified item |
| `GET`  | `/api/student/ratings/me` | List all ratings you have submitted |

### Reviews (Comments)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/student/reviews` | Write a comment review (Max 3 reviews per item) |
| `DELETE`| `/api/student/reviews/:id` | Delete a specific review comment |
| `GET`  | `/api/student/reviews/me` | List all review comments you have written |

---

## 7. Notifications
**Base Route:** `/api/student/notifications`  
**Guard:** `StudentAuthGuard`

- `GET /api/student/notifications` – List notifications.
  - **Expected Response:**
  ```json
  [
    {
      "id": "ObjectId",
      "recipientId": "ObjectId",
      "recipientType": "STUDENT",
      "title": "string",
      "message": "string",
      "type": "NotificationType",
      "category": "REVIEW_CREATED | REQUEST_UPDATED | REQUEST_CREATED",
      "link": "string | null",
      "itemId": "ObjectId | null",
      "itemCategory": "PRODUCT | PROPERTY | SERVICE | null",
      "isRead": "boolean",
      "createdAt": "DateTime",
      "updatedAt": "DateTime"
    }
  ]
  ```
- `PATCH /api/student/notifications/:id/read` – Mark single notification as read.
- `PATCH /api/student/notifications/read-all` – Mark all notifications as read.

### WebSockets Connection for Notifications
- **URL**: `ws://<backend-url>/notifications`
- **Authentication**: Automatically authenticated via the `access_token` cookie sent during the HTTP handshake. No token needs to be passed manually.

#### Events Emitted from Client (Frontend -> Backend)
- `markAsRead`: Send this event to mark a specific notification as read.
  - **Payload:** `{ "notificationId": "string" }`
- `markAllAsRead`: Send this event to mark all notifications as read.
  - **Payload:** None (or `{}`)

#### Events Received by Client (Backend -> Frontend)
- `newNotification`: Triggered when the backend creates a new notification for you.
  - **Payload:** The saved `Notification` object.
- `notificationRead`: Acknowledgment that a notification was marked as read.
  - **Payload:** `{ "notificationId": "string" }`
- `allNotificationsRead`: Acknowledgment that all notifications were marked as read.
  - **Payload:** `{ "success": true }`

---

## 8. Requests
**Base Route:** `/api/student/requests`  
**Guard:** `StudentAuthGuard`  
Students can send requests for properties, products, or services. Triggers an awaiting response notification to the student upon creation.

### `POST /api/student/requests`
- **Description:** Submit a request for an item.
- **Payload:**
```json
{
  "itemId": "string",
  "itemCategory": "PRODUCT | PROPERTY | SERVICE",
  "message": "string" // Optional message detailing the request
}
```
- **Notifications triggered:** 
  1. Student gets an `"Awaiting Response"` notification confirming submission.
  2. Agent gets a `"New Request Received"` notification.

### `GET /api/student/requests`
- **Description:** Get all requests submitted by the logged-in student.

---

## 9. Chat System

**Base Route:** `/api/student/chats`  
**Guard:** `StudentAuthGuard`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/student/chats` | Fetch all chats the student is part of |
| `GET` | `/api/student/chats/:chatId` | Fetch details of a specific chat |
| `POST` | `/api/student/chats/initiate` | Create or get an existing chat with an agent |
| `GET` | `/api/student/chats/:chatId/messages` | Fetch paginated messages in a chat |
| `PATCH` | `/api/student/chats/:chatId/read` | Mark all unread messages from the agent as read |

### `GET /api/student/chats`
- **Description:** Fetch all conversations involving the logged-in student.
- **Expected Response:** An array of Chat objects, including the latest message for preview.
```json
[
  {
    "id": "ObjectId",
    "studentId": "ObjectId",
    "agentId": "ObjectId",
    "itemId": "ObjectId | null",
    "itemCategory": "PRODUCT | PROPERTY | SERVICE | null",
    "createdAt": "DateTime",
    "updatedAt": "DateTime",
    "agent": {
      "id": "ObjectId",
      "firstName": "string",
      "lastName": "string",
      "companyName": "string",
      "profileImage": { "url": "string", "public_id": "string" }
    },
    "messages": [
      {
        "id": "ObjectId",
        "chatId": "ObjectId",
        "senderId": "ObjectId",
        "senderType": "STUDENT | AGENT",
        "content": "string",
        "isRead": "boolean",
        "createdAt": "DateTime"
      }
    ]
  }
]
```

### `POST /api/student/chats/initiate`
- **Description:** Get an existing chat room or create a new one to start talking to an agent.
- **Payload:**
```json
{
  "agentId": "ObjectId (Required)",
  "itemId": "ObjectId (Optional)",
  "itemCategory": "PROPERTY | PRODUCT | SERVICE (Optional)"
}
```
- **Expected Response:** The `Chat` object.

### `GET /api/student/chats/:chatId/messages`
- **Description:** Fetch messages in a chat (paginated).
- **Query Params:** `?limit=50&skip=0`
- **Expected Response:** An array of `Message` objects.
```json
[
  {
    "id": "ObjectId",
    "chatId": "ObjectId",
    "senderId": "ObjectId",
    "senderType": "STUDENT | AGENT",
    "content": "string",
    "isRead": "boolean",
    "createdAt": "DateTime"
  }
]
```

### WebSockets Connection
- **URL**: `ws://<backend-url>/chat`
- **Authentication**: Automatically authenticated via the `access_token` cookie sent during the HTTP handshake. No token needs to be passed manually.

#### Events Emitted from Client (Frontend -> Backend)
- `joinChat`: Subscribe to a chat room to listen for messages.
  - **Payload:** `{ "chatId": "string" }`
- `sendMessage`: Send a new message to the room.
  - **Payload:** `{ "chatId": "string", "senderId": "string", "senderType": "STUDENT", "content": "string" }`
- `markAsRead`: Send this event to mark all messages in a chat as read.
  - **Payload:** `{ "chatId": "string" }`
- `deleteMessage`: Send this event to delete a specific message (you must be the sender).
  - **Payload:** `{ "messageId": "string", "chatId": "string" }`

#### Events Received by Client (Backend -> Frontend)
- `newMessage`: Triggered when a new message is sent to the chat room.
  - **Payload:** The saved `Message` object.
- `messagesRead`: Acknowledgment that messages were read by the other party.
  - **Payload:** `{ "chatId": "string", "readBy": "STUDENT" | "AGENT", "readerId": "string" }`
- `messageDeleted`: Triggered when a message is successfully deleted.
  - **Payload:** `{ "messageId": "string", "chatId": "string" }`

---

## 10. Reports
**Base Route:** `/api/student/reports`  
**Guard:** `StudentAuthGuard`  
Students can report agents, items (properties, products, services), or submit general feedback/issues.

### `POST /api/student/auth/forgot-password`
Generates a 6-digit OTP, saves it in `resetOtp` with a 10 min expiry, and emails it via Resend.
- **Payload:** `{ "email": "student@camproxi.com" }`
- **Response (200 OK):** `{ "message": "Password reset email sent" }`

### `POST /api/student/auth/reset-password`
Validates the OTP and updates the password.
- **Payload:** 
  ```json
  { 
    "email": "student@camproxi.com",
    "otp": "123456",
    "newPassword": "newSecurePassword123"
  }
  ```
- **Response (200 OK):** `{ "message": "Password reset successfully" }`

### `POST /api/student/reports`
Submit a new report.
- **Payload:**
```json
{
  "subject": "Inappropriate behavior",
  "message": "The agent was rude and unprofessional.",
  "targetType": "AGENT | ITEM | GENERAL",
  "targetId": "ObjectId (Optional)",
  "itemCategory": "PROPERTY | PRODUCT | SERVICE (Optional)"
}
```

### `GET /api/student/reports`
Fetch all reports submitted by the logged-in student.
- **Expected Response:** Array of Report objects.
```json
[
  {
    "id": "ObjectId",
    "subject": "string",
    "message": "string",
    "targetType": "AGENT | ITEM | GENERAL",
    "targetId": "ObjectId | null",
    "itemCategory": "string | null",
    "status": "OPEN | RESOLVED",
    "reply": "string | null",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
]
```

---

## 11. Advanced Global Search
**Base Route:** `/api/student/search`  
**Guard:** `StudentAuthGuard`  
Allows students to search and filter products, properties, and services across their campus.

### `GET /api/student/search`
- **Query Parameters:**
  - `q` (string, optional): Search term for matching names and descriptions.
  - `category` (string, optional): Filter by `ALL` (default), `PRODUCT`, `PROPERTY`, or `SERVICE`.
  - `minPrice` (number, optional): Minimum price filter.
  - `maxPrice` (number, optional): Maximum price filter.
  - `sortBy` (string, optional): Order results by `price_asc`, `price_desc`, or `rating_desc`.
- **Expected Response (200 OK):** Array of items with an injected `type` field.
```json
[
  {
    "id": "ObjectId",
    "name": "string",
    "description": "string",
    "price": 100,
    "type": "PRODUCT | PROPERTY | SERVICE",
    "averageRating": 4.5,
    "totalReviews": 10,
    "createdAt": "DateTime",
    "images": []
  }
]
```


## School Information

### Get User's School
- **Endpoint:** \GET /api/student/profile/school\`n- **Auth:** Required (StudentAuthGuard)
- **Description:** Returns the specific school (and campus details) that the currently authenticated student is registered under.
- **Response:** The populated \School\ object.

### Get All Schools (Public)
- **Endpoint:** \GET /api/public/schools\`n- **Auth:** None (Public)
- **Description:** Fetches a list of all registered schools on the platform for population in registration dropdowns.
- **Response:** Array of \School\ objects (id, name, code, campus).



## Notifications & Push Tokens

### Get Notification Settings
- **Endpoint:** \GET /api/student/notifications/settings\`n- **Auth:** Required (StudentAuthGuard)
- **Description:** Loads the student's saved notification preferences (master switch, category toggles, email/push settings).
- **Response:** \NotificationSettings\ object.

### Update Notification Settings
- **Endpoint:** \PATCH /api/student/notifications/settings\`n- **Auth:** Required (StudentAuthGuard)
- **Description:** Saves updated settings whenever the student turns any notification toggle on or off.
- **Payload:** \UpdateSettingsDto\ (Partial \NotificationSettings\).
- **Response:** The updated \NotificationSettings\ object.

### Save Push Token
- **Endpoint:** \POST /api/student/notifications/push-token\`n- **Auth:** Required (StudentAuthGuard)
- **Description:** Saves the student's browser push token so they can receive push notifications on their device.
- **Payload:** \{ "token": "device_push_token_here" }\`n- **Response:** Success message.

### Remove Push Token
- **Endpoint:** \DELETE /api/student/notifications/push-token\`n- **Auth:** Required (StudentAuthGuard)
- **Description:** Removes the device push token when the student logs out or revokes push permissions.
- **Payload:** \{ "token": "device_push_token_here" }\`n- **Response:** Success message.


## Change Password

### POST /api/student/profile/change-password
- **Auth:** Required (StudentAuthGuard)
- **Description:** Allows an authenticated student to change their password.
- **Body:** { "oldPassword": "...", "newPassword": "..." }
- **Response:** Success message.
