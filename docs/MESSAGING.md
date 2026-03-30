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
    "sk": "Dobrý deň, ako sa máš?",
    "jp": "こんにちは、元気ですか？"
  },
  "createdAt": "2024-06-01T12:00:00Z"
}
```

| Field          | Purpose                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `chatId`       | UUID, generated on first conversation. Decoupled from participants for future group/channel support. |
| `messageId`    | UUID per message. Needed for idempotency, deletion, editing, and sort key uniqueness.                |
| `recipientId`  | The target user (DM). Required by the `onMessageReceived` subscription filter.                       |
| `type`         | Tells the frontend how to render (text, image preview, GIF embed, file download).                    |
| `attachments`  | S3 object keys (not URLs). Pre-signed GET URLs generated at read time.                               |
| `translations` | ISO 639-1 language codes as keys (`sk`, `fr`, `en`). Populated eagerly on send.                      |
| `content`      | Always the original language. "View original" displays this field directly.                          |

### 2.2 Chat Membership Item

One per user per chat. Powers the conversation list and read tracking. Acts like a join table in a relational db.

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

| Field                           | Purpose                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `chatType`                      | `DM`, `GROUP`, or `CHANNEL` — enables filtering and future expansion.                   |
| `participantId`                 | The other user in a DM. For group chats, replaced with separate membership items.       |
| `lastMessage` / `lastMessageAt` | Denormalized for sidebar previews. Updated on every new message.                        |
| `lastReadAt`                    | Messages with `createdAt > lastReadAt` are unread. Replaces per-message read booleans.  |
| `archived`                      | Set to `true` on unfriend. Frontend renders as read-only; `sendMessage` rejects writes. |

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

| Field                | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `language`           | ISO 639-1 code. Defaults to `en` if unset.  |
| `translationEnabled` | Lets users opt out of translation entirely. |

### 2.4 New GSI

```
chatId-index:  PK = chatId,  SK = userId
```

Projected from chat membership items. Used to look up all members of a chat (needed by `sendMessage` for translation and membership updates).

---

## 3. GraphQL Schema Additions (Reference)

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
