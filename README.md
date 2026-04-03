# Uni-Verse

A real-time social messaging platform. Uni-Verse lets you chat in real time, and communicate across languages.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | AWS CDK, AppSync (GraphQL), Lambda, DynamoDB |
| Auth | AWS Cognito |
| Storage | AWS S3 |
| Real-time | AppSync subscriptions (WebSocket) |

## Features

- **Authentication** — Sign up, email verification, and sign in via Cognito
- **Friends** — Send, accept, decline, and cancel friend requests with real-time updates
- **Direct messaging** — Real-time 1:1 chat with message history and unread indicators
- **File & image sharing** — Upload images and files directly in chat via pre-signed S3 URLs
- **GIF support** — Search and send GIFs via Giphy integration
- **Message translation** — Auto-translate incoming messages to your preferred language, with on-demand per-message translation
- **Typing indicators** — Live typing status in active conversations
- **User profiles** — Update your username, avatar, and password from the settings panel
- **User search** — Find other users by username or email prefix

## Project Structure

```
packages/
  web/        # Next.js frontend
  backend/    # AWS CDK infrastructure & Lambda functions
  shared/     # Shared types
```

## Getting Started

### Backend

```bash
npm install
npm run deploy:backend:dev
```

### Frontend

Copy `packages/web/example.env` to `packages/web/.env.local` and fill in the values from the CDK deployment outputs, then:

```bash
npm install
npm run dev:web
```
