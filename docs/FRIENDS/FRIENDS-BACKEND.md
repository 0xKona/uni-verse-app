# Friends Management - Backend

## Overview

Friends functionality is powered by AppSync GraphQL with DynamoDB storage and Cognito for user data.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   AppSync   │────▶│  DynamoDB   │     │   Cognito   │
│   GraphQL   │     │   (friends) │     │   (users)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       ▲
       │            ┌─────────────┐            │
       └───────────▶│   Lambda    │────────────┘
                    │  (queries)  │
                    └─────────────┘
```

## Data Model

Friend requests stored in DynamoDB with single-table design:

| Key | Pattern | Description |
|-----|---------|-------------|
| PK | `USER#<senderId>` | Sender's partition |
| SK | `FRIEND#<recipientId>` | Friend relationship |

**GSIs:**
- `recipient-index` — Query requests by recipient
- `status-index` — Query by status (PENDING/ACCEPTED)

## Resolvers

### VTL (Direct DynamoDB)
Simple single-operation queries/mutations:
- `sendFriendRequest` — Create PENDING request
- `getFriends` — Query ACCEPTED relationships
- `getPendingRequests` — Query incoming requests
- `getSentRequests` — Query outgoing requests
- `cancelFriendRequest` — Delete own request

### Lambda
Complex operations requiring transactions:
- `respondToFriendRequest` — Accept/decline (transactional write)
- `removeFriend` — Delete both sides atomically
- `getUser` / `getUsers` / `searchUsers` — Cognito lookups

## Subscriptions

Real-time updates via `@aws_subscribe` directive:

| Subscription | Triggers On | Filter |
|--------------|-------------|--------|
| `onFriendRequestReceived` | `sendFriendRequest` | `recipientId` |
| `onFriendRequestUpdated` | `respondToFriendRequest` | None (client filters) |
| `onFriendListUpdated` | `respondToFriendRequest`, `removeFriend` | None (client filters) |

**Note:** No resolvers needed for subscriptions — the directive handles everything.

## File Structure

```
lib/
├── graphql/schema.graphql       # GraphQL schema
├── constructs/api/
│   ├── friend-vtl-resolvers.ts  # DynamoDB direct resolvers
│   └── lambda-resolvers.ts      # Lambda-backed resolvers
└── lambda/
    ├── users/                   # Cognito user queries
    ├── respondToFriendRequest/  # Accept/decline
    └── removeFriend/            # Delete friendship
```
