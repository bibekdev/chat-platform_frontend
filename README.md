# Chat Platform — Frontend

A modern real-time chat application built with Next.js, featuring instant messaging, voice/video calls, friend management, online presence, and a polished UI with dark mode support.

## Tech Stack

| Category              | Technology                                     |
| --------------------- | ---------------------------------------------- |
| **Framework**         | Next.js 16 (App Router, Turbopack)             |
| **Language**          | TypeScript v5.9                                |
| **UI Library**        | React 19                                       |
| **Styling**           | Tailwind CSS v4, OKLCH color system            |
| **Component Library** | Radix UI primitives                            |
| **Icons**             | Lucide React                                   |
| **State Management**  | TanStack Query (React Query) v5                |
| **Forms**             | React Hook Form v7 + Zod v4                    |
| **HTTP Client**       | Axios (with interceptors + auto token refresh) |
| **Real-Time**         | Socket.IO Client v4.8                          |
| **Voice/Video**       | WebRTC (custom peer manager)                   |
| **File Upload**       | UploadThing                                    |
| **Theming**           | next-themes (dark/light)                       |
| **Notifications**     | Sonner                                         |
| **Date Formatting**   | date-fns                                       |
| **Package Manager**   | bun                                            |

## Features

### Real-Time Messaging

- Instant message delivery via Socket.IO
- Send, edit, and delete messages
- Message attachments (images, files, audio, video) via UploadThing
- Typing indicators
- Read receipts
- Emoji reactions (add/remove)
- Reply to messages
- Infinite scroll message history

### Voice & Video Calls

- Peer-to-peer WebRTC audio/video calls
- Incoming call notification dialog
- Active call overlay with controls
- Mute audio / toggle video
- Group call support
- Call signaling via Socket.IO

### Conversations

- Direct (1:1) and group conversations
- Real-time conversation list updates
- Unread message count badges
- Create group conversations with member selection
- Conversation settings (name, members, roles)
- Leave / delete conversations

### Friend System

- Browse user suggestions
- Send, accept, reject, and cancel friend requests
- Incoming request count badge
- Remove friends
- Tabbed interface (All Friends, Online, Incoming, Sent)

### Online Presence

- Real-time online/offline user tracking
- Green dot indicator for online friends
- Online friends tab
- Presence events via WebSocket

### Authentication

- Login and registration forms
- JWT access + refresh token flow
- Automatic token refresh on 401 responses
- Cookie-based token storage
- Server-side auth helpers for SSR
- Protected routes

### UI/UX

- Dark mode support (system preference + manual toggle)
- Responsive sidebar navigation
- Modern design with Radix UI primitives
- Custom OKLCH color palette with CSS variables
- Toast notifications (Sonner)
- Loading spinners and empty states
- Form validation with inline error messages

## State Management

### TanStack Query (React Query)

Primary data fetching and server-state management. Configured with:

- **Stale time:** 60 seconds
- **GC time:** 5 minutes
- **Retry:** Smart retry logic
- **Server-side prefetching** with hydration for SSR

**Query key factory** (`lib/queryKeys.ts`):

```typescript
queryKeys.auth.me();
queryKeys.user.suggestions();
queryKeys.friends.friends();
queryKeys.friends.incomingRequestsCount();
queryKeys.conversations.list();
queryKeys.conversations.details(id);
queryKeys.messages.list(conversationId);
```

### React Context Providers

| Provider                 | Purpose                        |
| ------------------------ | ------------------------------ |
| `QueryProvider`          | React Query client             |
| `ThemeProvider`          | Dark/light mode (next-themes)  |
| `SocketProvider`         | Socket.IO connection lifecycle |
| `OnlinePresenceProvider` | Track which users are online   |
| `CallProvider`           | WebRTC call state + signaling  |

## Socket Events

### Presence

| Event           | Direction        | Description                 |
| --------------- | ---------------- | --------------------------- |
| `userOnline`    | Server -> Client | Friend came online          |
| `userOffline`   | Server -> Client | Friend went offline         |
| `onlineFriends` | Server -> Client | Initial online friends list |

### Messaging

| Event                              | Direction        | Description             |
| ---------------------------------- | ---------------- | ----------------------- |
| `conversation:join`                | Client -> Server | Join conversation room  |
| `conversation:leave`               | Client -> Server | Leave conversation room |
| `message:send`                     | Client -> Server | Send a message          |
| `message:new`                      | Server -> Client | New message received    |
| `message:updated`                  | Server -> Client | Message was edited      |
| `message:deleted`                  | Server -> Client | Message was deleted     |
| `message:read`                     | Client -> Server | Mark messages as read   |
| `typing:start` / `typing:stop`     | Client -> Server | Typing indicators       |
| `user:typing`                      | Server -> Client | Someone is typing       |
| `reaction:add` / `reaction:remove` | Client -> Server | Message reactions       |

### Call Signaling

| Event                         | Direction        | Description         |
| ----------------------------- | ---------------- | ------------------- |
| `call:initiate`               | Client -> Server | Start a call        |
| `call:incoming`               | Server -> Client | Incoming call       |
| `call:accept` / `call:reject` | Client -> Server | Accept or reject    |
| `call:offer` / `call:answer`  | Bidirectional    | WebRTC SDP exchange |
| `call:ice-candidate`          | Bidirectional    | ICE candidates      |
| `call:end`                    | Client -> Server | End call            |
| `call:ended`                  | Server -> Client | Call ended          |

## API Integration

The Axios client (`lib/api.ts`) handles:

- Base URL from `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080/api/v1`)
- Automatic `Authorization` header from cookies
- 401 interception with automatic token refresh and request retry
- Custom `ApiError` class for structured error handling

Server-side API client (`lib/api-server.ts`) forwards cookies for SSR requests.

## Routing

| Route                 | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `/`                   | Home / landing page                                   |
| `/login`              | Login page                                            |
| `/register`           | Registration page                                     |
| `/conversations`      | Conversation list                                     |
| `/conversations/[id]` | Individual conversation chat view                     |
| `/friends`            | Friend management (tabs: All, Online, Incoming, Sent) |

Route groups:

- `(auth)` — Public auth pages
- `(main)` — Authenticated pages with sidebar, socket, presence, and call providers

## Design System

- **Colors:** Custom OKLCH palette with CSS variables for light and dark themes
- **Fonts:** Geist Sans, Geist Mono
- **Border radius:** 0.65rem
- **Shadows:** Custom scale (2xs through 2xl)
- **Dark mode:** System preference detection + manual toggle via next-themes
- **Components:** Built on Radix UI primitives for accessibility
- **Utility:** `cn()` helper (clsx + tailwind-merge)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm
- Backend API running (see backend README)

### Setup

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables** — create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app runs at [http://localhost:3000](http://localhost:3000) with Turbopack.

### Scripts

| Script          | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start dev server with Turbopack |
| `npm run build` | Production build                |
| `npm start`     | Start production server         |
| `npm run lint`  | Lint and auto-fix               |

## Architecture

```
Browser
  │
  ├── Next.js App Router (SSR + Client)
  │     ├── Server Components → api-server.ts → Backend REST API
  │     └── Client Components → api.ts (Axios) → Backend REST API
  │
  ├── Socket.IO Client
  │     ├── SocketManager (connect, reconnect, emit, listen)
  │     ├── SocketProvider (React context)
  │     └── useSocket / useSocketEvent hooks
  │
  ├── WebRTC
  │     ├── PeerManager (SDP offer/answer, ICE candidates)
  │     ├── CallProvider (React context)
  │     └── ActiveCallOverlay / IncomingCallDialog
  │
  └── TanStack Query
        ├── Server-side prefetch + hydration
        ├── Client-side cache + invalidation
        └── Optimistic updates on mutations

Provider Hierarchy:
  ThemeProvider
    └── QueryProvider
          └── SocketProvider
                └── OnlinePresenceProvider
                      └── CallProvider
                            └── App Routes
```
