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
- `markAsRead`: Send this event when the user opens the chat UI to automatically mark unread messages as read.
  - **Payload:** `{ "chatId": "string" }`

#### Events Received by Client (Backend -> Frontend)
- `newMessage`: Triggered when a new message is saved to the DB.
  - **Payload:** The saved `Message` object.
- `messagesRead`: Triggered when the other user (agent) reads your messages. Use this to update your UI (e.g. gray ticks to blue ticks).
  - **Payload:** `{ "chatId": "string", "readBy": "AGENT", "readerId": "string" }`
