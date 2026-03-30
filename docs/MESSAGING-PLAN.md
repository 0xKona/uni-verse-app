# Messaging Implementation Plan

## 1. Requirements

- Send and receive instant messages.
- Users can set a language; incoming messages will be translated on send.
- Users can click a button to view a message in the original language.
- Users can retrospectively translate older messages on demand.
- Users can send files and images via S3 pre-signed URLs.
- Users can search and send Tenor GIFs (client-side, sent as a URL).
- Users should see when another user is typing.
- Chats persist after unfriending (read-only).

---

## 2. Data Model

All items live in the existing single-table (`PK`/`SK`).

### 2.1 Message Item

```json
{
  "PK": "CHAT#<chatId>",
  "SK": "MSG#<timestamp>#<messageId>",
  "chatId": "<uuid>",
  "messageId": "<uuid>",
  "senderId": "<cognito-sub>",
  "recipientId": "<cognito-sub>",
  "type": "TEXT | IMAGE | GIF | FILE",
  "content": "Hello, how are you?",
  "attachments": ["messages/<chatId>/<messageId>/photo.jpg"],
  "translations": {
    "sk": "Dobrý deň, ako sa máš?"
  },
  "createdAt": "2024-06-01T12:00:00Z"
}
```

| Field | Purpose |
|-------|---------|
| `chatId` | UUID, generated on first conversation. Decoupled from participants for future group/channel support. |
| `messageId` | UUID per message. Needed for idempotency, deletion, editing, and sort key uniqueness. |
| `recipientId` | The target user (DM). Required by the `onMessageReceived` subscription filter. |
| `type` | Tells the frontend how to render (text, image preview, GIF embed, file download). |
| `attachments` | S3 object keys (not URLs). Pre-signed GET URLs generated at read time. |
| `translations` | ISO 639-1 language codes as keys (`sk`, `fr`, `en`). Populated eagerly on send. |
| `content` | Always the original language. "View original" displays this field directly. |

### 2.2 Chat Membership Item

One per user per chat. Powers the conversation list and read tracking.

```json
{
  "PK": "USER#<userId>",
  "SK": "CHAT#<chatId>",
  "chatId": "<uuid>",
  "chatType": "DM",
  "participantId": "<other-user-id>",
  "lastMessage": "Hello, how are you?",
  "lastMessageAt": "2024-06-01T12:00:00Z",
  "lastReadAt": "2024-06-01T11:59:00Z",
  "archived": false
}
```

| Field | Purpose |
|-------|---------|
| `chatType` | `DM`, `GROUP`, or `CHANNEL` — enables filtering and future expansion. |
| `participantId` | The other user in a DM. For group chats, replaced with separate membership items. |
| `lastMessage` / `lastMessageAt` | Denormalized for sidebar previews. Updated on every new message. |
| `lastReadAt` | Messages with `createdAt > lastReadAt` are unread. Replaces per-message read booleans. |
| `archived` | Set to `true` on unfriend. Frontend renders as read-only; `sendMessage` rejects writes. |

### 2.3 User Profile Item

Global user preferences. Used by the translation system.

```json
{
  "PK": "USER#<userId>",
  "SK": "PROFILE",
  "language": "sk",
  "translationEnabled": true
}
```

| Field | Purpose |
|-------|---------|
| `language` | ISO 639-1 code. Defaults to `en` if unset. |
| `translationEnabled` | Lets users opt out of translation entirely. |

### 2.4 New GSI

```
chatId-index:  PK = chatId,  SK = userId
```

Projected from chat membership items. Used to look up all members of a chat (needed by `sendMessage` for translation and membership updates).

---

## 3. Implementation Stages

### Stage 1 — Foundation (schema, profiles, chat creation) ✅

Everything needed before a single message can be sent.

**Backend:**
- [x] Add `chatId-index` GSI to `UniVerseTable`
- [x] Add GraphQL types: `Message`, `MessageConnection`, `Chat`, `UserProfile`, `TypingIndicator`, `MessageType` enum
- [x] Add `setUserProfile` / `getUserProfile` — Lambda + VTL resolver to read/write `USER#<id> / PROFILE`
- [x] Add `createChat(participantId)` — Lambda that checks for existing DM, generates `chatId` if new, writes membership items for both users in a transaction
- [x] Add `getChats` — query `USER#<id> / CHAT#*` to list conversations
- [x] Add `markChatRead` — VTL resolver to update `lastReadAt`

**Frontend:**
- [x] Language settings UI — popover with language select and translation toggle in `UserSettingsCard`
- [ ] Conversation list sidebar — fetch `getChats`, render with `lastMessage` preview and unread badge (built in Stage 2)

### Stage 2 — Core messaging (send, receive, real-time) ✅

Basic text messaging end-to-end.

**Backend:**
- [x] Add `sendMessage` Lambda — validates `archived` flag, writes message item, updates both membership items (`lastMessage`, `lastMessageAt`), returns message with `recipientId`
- [x] Add `getMessages(chatId, nextToken)` — paginated query on `CHAT#<chatId>` with `ScanIndexForward: false`, cursor-based pagination
- [x] Add `markChatRead(chatId)` — updates `lastReadAt` on the caller's membership item (done in Stage 1)
- [x] Add `onMessageReceived(recipientId)` subscription — `@aws_subscribe(mutations: ["sendMessage"])` (schema done in Stage 1)

**Frontend:**
- [x] Conversation list sidebar — `ConversationList` component with user avatars, message previews, unread indicators
- [x] Chat conversation view — `MessageList` with infinite scroll (cursor pagination via `nextToken`)
- [x] Message input component — `MessageInput` with text input, Enter to send, disabled for archived chats
- [x] Real-time subscription — `useMessageSubscription` subscribes on login with own `userId`, invalidates queries on incoming messages
- [x] Mark as read — calls `markChatRead` when user selects a conversation

### Stage 3 — Translation ✅

**Backend:**
- [x] Extend `sendMessage` Lambda — `BatchGetItem` participant profiles, call Amazon Translate for each unique target language, store in `translations` map
- [x] Add `translateMessage(chatId, messageId, timestamp)` mutation — reads message, calls Translate for caller's language, patches `translations` map, caches result
- [x] IAM permissions for `translate:TranslateText` on both Lambdas

**Frontend:**
- [x] Display translated content — if user's language exists in `translations` map and translation is enabled, show it automatically
- [x] "View original" / "View translated" toggle button on translated messages
- [x] "Translate" button — for messages without the user's language in `translations`, calls `translateMessage` on demand

### Stage 4 — File & image uploads ✅

**Backend:**
- [x] Add `getUploadUrl(chatId, fileName)` mutation — Lambda generates `messageId`, builds S3 key `messages/<chatId>/<messageId>/<fileName>`, returns pre-signed PUT URL (5 min expiry, 25MB max)
- [x] Extend `getMessages` resolver — for each `attachments` entry, generate a pre-signed GET URL (1 hour expiry)

**Frontend:**
- [x] File upload button in message input — paperclip button, pending file preview, calls `getUploadUrl`, uploads to S3, then calls `sendMessage` with `type: "IMAGE"` or `"FILE"` and the S3 key in `attachments`
- [x] Message rendering — images shown inline from pre-signed URL, files shown as download links with filename

### Stage 5 — Tenor GIFs

No backend work.

**Frontend:**
- [ ] Integrate Tenor Search API (client-side API key, domain-restricted)
- [ ] GIF picker component in message input — search, select, sends `sendMessage` with `type: "GIF"` and `content` set to the Tenor URL
- [ ] Render `GIF` messages as embedded images from the URL

### Stage 6 — Typing indicators

**Backend:**
- [ ] Add `sendTypingIndicator(chatId)` mutation — uses `NONE` data source (no DynamoDB write)
- [ ] Add `onTypingIndicator(chatId)` subscription — `@aws_subscribe(mutations: ["sendTypingIndicator"])`

**Frontend:**
- [ ] Send typing events on keypress (debounced, e.g. every 2 seconds)
- [ ] Subscribe to `onTypingIndicator` for the active chat
- [ ] Show "user is typing..." indicator, auto-dismiss after timeout

### Stage 7 — Unfriend archival

**Backend:**
- [ ] Extend `removeFriend` Lambda — after deleting friend items, set `archived: true` on both users' chat membership items

**Frontend:**
- [ ] Check `archived` flag on conversation — hide message input, show "This conversation is read-only" banner
- [ ] Keep conversation visible and scrollable in sidebar

---

## 4. GraphQL Schema Additions (Reference)

```graphql
# Types
type Message {
  chatId: ID!
  messageId: ID!
  senderId: ID!
  recipientId: ID!
  type: MessageType!
  content: String!
  attachments: [String]
  translations: AWSJSON
  createdAt: String!
}

type MessageConnection {
  messages: [Message!]!
  nextToken: String
}

type Chat {
  chatId: ID!
  chatType: String!
  participantId: ID!
  lastMessage: String
  lastMessageAt: String
  lastReadAt: String
  archived: Boolean
}

type UserProfile {
  language: String!
  translationEnabled: Boolean!
}

type TypingIndicator {
  chatId: ID!
  userId: ID!
}

enum MessageType {
  TEXT
  IMAGE
  GIF
  FILE
}

# Queries
getMessages(chatId: ID!, nextToken: String): MessageConnection!
getChats: [Chat!]!
getUserProfile: UserProfile

# Mutations
sendMessage(chatId: ID!, content: String!, type: MessageType!, attachments: [String]): Message!
createChat(participantId: ID!): Chat!
markChatRead(chatId: ID!): Boolean!
getUploadUrl(chatId: ID!, fileName: String!): String!
setUserProfile(language: String!, translationEnabled: Boolean!): UserProfile!
translateMessage(chatId: ID!, messageId: ID!, timestamp: String!): Message!
sendTypingIndicator(chatId: ID!): TypingIndicator!

# Subscriptions
onMessageReceived(recipientId: ID!): Message
  @aws_subscribe(mutations: ["sendMessage"])
onTypingIndicator(chatId: ID!): TypingIndicator
  @aws_subscribe(mutations: ["sendTypingIndicator"])
```
