# Uni-Verse Frontend Makeover — Implementation Plan

## Context

Uni-Verse is a real-time social messaging platform (Next.js 15/16, AWS AppSync, Lambda, DynamoDB, Cognito) originally built as a distributed-systems assignment with a backend focus. This pass is a full frontend makeover to make it portfolio-grade.

## Locked-in Decisions

- **Brand:** Keep the name "Uni-Verse"; cosmic/dark-glass "deep space messenger" identity
- **Accent:** Violet/indigo gradient + glow utilities
- **Theme:** Dark-first (default) with a persisted light/dark toggle
- **Demo:** Pre-provisioned Cognito demo account + "Try demo" button
- **Audience:** Recruiters (30s first impression) + demo reviewers

## New Dependencies

- `sonner` — global toast notifications
- Space Grotesk (or similar display font) via `next/font/google`

---

## Phase 0 — Foundation & Cleanup

### 0.1 Design tokens (`src/app/globals.css`)
- [x] Replace monochrome `--primary` with brand violet/indigo accent (`--primary`, `--primary-foreground`, hover states)
- [x] Define brand gradients and glow utilities (e.g. `.bg-brand-gradient`, `.glow`/usage matching Tailwind v4 `@theme` syntax)
- [x] Update cosmic dark background tokens (`--background`, `--foreground`, `--muted`, etc.) to match dark-first identity
- [x] Wire up the currently unused `--sidebar-*` token set for the nav rail/sidebar
- [x] Add `--font-heading` display-font usage (new heading utility class)
- [x] Add `body` smooth-scroll and selection color polish
- [x] Verify both `.light` and `.dark` variants work with new tokens

### 0.2 Fonts & root layout (`src/app/layout.tsx`)
- [x] Add Space Grotesk (heading) font via `next/font/google` alongside Geist/Geist Mono
- [x] Set `html`/`body` className for heading font + brand tokens
- [x] Refresh `metadata` (title, description) for the new brand
- [x] Add favicon/logo asset to `src/app/` (replace stock Next.js one)

### 0.3 Theme provider + toggle
- [x] Add `ThemeProvider` (client) backed by local-storage persistence with system-detection fallback
- [x] Default to dark; persist user choice
- [x] Mount provider in root layout inside `QueryProvider`
- [x] Add a theme toggle button in the dashboard profile menu (and landing page nav if added)

### 0.4 Image config (`next.config.ts`)
- [ ] Add `images.remotePatterns` for S3 media bucket and Giphy domains

### 0.5 Debug cleanup
- [ ] Remove `console.log`s in `components/chat/conversation-list.tsx`, `components/ui/user-card.tsx`, `components/user/settings-dialog/`
- [ ] Remove hardcoded `TEST_EMAILS` behavior in `components/user/settings-dialog/change-password.tsx`
- [ ] Sweep grep for any remaining `console.log`/`console.error` in feature code

---

## Phase 1 — Landing Page (`src/app/page.tsx`)

- [ ] Build hero section: gradient headline, one-line value prop, product mockup / hero visual (CSS/SVG, no new assets required)
- [ ] Add primary CTAs: Sign In, Create Account, Try demo (demo CTA added in Phase 5)
- [ ] Keep the server-side auth check (logged-in users see "Dashboard" instead)
- [ ] Add feature grid: real-time messaging, auto translation, file/GIF sharing, typing indicators
- [ ] Add architecture section: visual diagram of CDK stacks (Auth/API/Data), AppSync, Lambda, DynamoDB, Cognito
- [ ] Add footer with GitHub source link
- [ ] Add a slim top nav bar (logo + Sign In / Create Account links, responsive)
- [ ] Add subtle cosmic background treatment (gradient glows / starfield) with `loading`-aware skeleton if fetch slow

---

## Phase 2 — Auth Screens

### 2.1 Shared auth layout
- [ ] Create a shared split-screen auth layout/component: branded panel (gradient, logo, feature bullets) + form card on the right
- [ ] Make split-screen responsive (branded panel hidden/condensed on mobile, stacked layout)

### 2.2 Login (`src/app/login/page.tsx`)
- [ ] Rework form into brand-styled card (labels, inputs, focus rings per new tokens)
- [ ] Add show/hide password toggle
- [ ] Add "Forgot password" flow (`lib/auth.ts`: `resetPassword` + `confirmResetPassword`; UI: email → code + new password views)
- [ ] Wire forgot-password success/error to inline states (or Phase 4 toast)
- [ ] Add "Try demo" link (Phase 5)
- [ ] Add "Don't have an account? Sign up" swap link (keep)

### 2.3 Signup (`src/app/signup/page.tsx`)
- [ ] Rework register view into brand-styled card
- [ ] Add show/hide password toggle
- [ ] Add inline password-strength hint
- [ ] Rework email-verification (code) step with brand styling
- [ ] Add **Resend code** button (`resendSignUpCode` in Amplify)
- [ ] Add auto-focus + enter-to-submit on code input
- [ ] Verify Cognito pool settings allow `resend`/`reset`; add note to `docs/` if pool config change is needed

---

## Phase 3 — Dashboard Shell & Mobile Responsiveness

### 3.1 Nav rail (`src/app/dashboard/layout.tsx`)
- [ ] Migrate rail to `--sidebar-*` tokens + brand styling
- [ ] Make rail responsive: `w-16` on desktop, hidden on mobile
- [ ] Add mobile bottom tab bar (DMs icon + any nav items) with active state
- [ ] Add unread badge counts on nav items (requires chat unread aggregation)
- [ ] Keep `TooltipProvider` + `SideBarButton` behavior; add active squircle/pill to new tokens

### 3.2 Mobile layout
- [ ] Build a mobile top header (hamburger / app title / theme toggle) above content
- [ ] Convert DM sidebar (`components/chat/dm-sidebar.tsx`) into a slide-in drawer on mobile (new overlay + drawer component, or sheet)
- [ ] Add mobile connection between bottom-bar, header, and drawer state
- [ ] Desktop remains current 2-pane split (sidebar + chat panel)

### 3.3 Responsive widths/breakpoints
- [ ] Audit `components/chat/*` and `components/user/*` for fixed widths (`w-60`, `w-68`, etc.) and make them breakpoint-aware
- [ ] Add `sm:`, `md:`, `lg:` responsive classes to chat panel, message list, and dialogs where needed
- [ ] Verify all dialogs/popovers open on small screens (existing `sm:max-w-*` primitives)

---

## Phase 4 — Chat & Messaging Polish

### 4.1 Skeletons & loading
- [ ] Create `components/ui/skeleton.tsx` (shimmer on brand tokens)
- [ ] Replace "Loading…" and "Loading messages…" text in `conversation-list.tsx`, `friends-list.tsx`, `message-list.tsx`, request lists
- [ ] Add skeleton rows for conversation/friend lists and message bubbles
- [ ] Fix `empty-state.tsx` semantic bug (currently used for both loading AND empty)

### 4.2 Toasts (sonner)
- [ ] Add `sonner` provider into root layout
- [ ] Replace scattered inline `text-destructive` error handling with toasts where appropriate (send message, upload, friend request actions, settings)
- [ ] Add success/feedback toasts: friend request sent, accepted, message sent, theme change, demo sign-in
- [ ] Surface silent `console.error`s (upload, subscription failures) to toasts
- [ ] Remove now-unused inline error paragraphs

### 4.3 Message list polish (`components/chat/message-list.tsx`)
- [ ] Add day dividers between messages on different dates
- [ ] Group consecutive messages from the same sender (reduced spacing, avatar only on last of a group)
- [ ] Add simplified timestamps (grouped; HH:MM on hover or in bubble footer)
- [ ] Add delivered/read indicators (checkmarks) for own messages (requires `lastReadAt` data already present)
- [ ] Polish translation toggle (Translate/View original/View translated) per new tokens
- [ ] Style IMAGE/FILE/GIF attachments for the new theme (rounded, ring, hover zoom)

### 4.4 Empty states (`components/ui/empty-state.tsx`)
- [ ] Upgrade to icon + heading + description + actionable CTA (e.g. "Add a friend", "Start a chat")
- [ ] Update all empty-state call sites to pass icons/CTAs

### 4.5 Conversation list (`components/chat/conversation-list.tsx`)
- [ ] Add client-side search filter by participant name
- [ ] Add unread badge counts per conversation
- [ ] Polish `conversation-card.tsx` hover/active states with new tokens; add avatar ring for active chat

### 4.6 Profile & settings polish
- [ ] Polish `components/user/user-profile-card.tsx` (glass card, avatar, theme toggle in popover)
- [ ] Polish settings dialog: avatar upload preview, section styling
- [ ] Verify ChangePassword validation UI against new theme

---

## Phase 5 — Demo / Guest Access

- [ ] Create a pre-provisioned Cognito demo account (script in `packages/backend/scripts/` to create user via AWS Cognito admin API, or documented manual step)
- [ ] Seed the demo account with a handful of messages/requests so the first impression is populated (best-effort; optional)
- [ ] Add "Try demo" button on landing page and login page that fills + submits demo credentials (dev-only, gated by env flag like `NEXT_PUBLIC_DEMO_CREDENTIALS`)
- [ ] Ensure demo creds are never committed to source (`.env.local` only / not in git)
- [ ] Update README + a `docs/DEMO.md` with demo sign-in instructions for reviewers

---

## Phase 6 — QA & Final Verification

- [ ] `npm run lint` clean across repo
- [ ] `npm run build` (web) clean; fix any type errors
- [ ] Backend `npm run build` still clean (if touched)
- [ ] Manual browser pass at desktop (1440px+), tablet, and mobile widths
- [ ] Verify auth flows: signup → confirm → login; forgot password; resend code
- [ ] Verify real-time: message send/receive on two sessions, typing indicator, friend request live update
- [ ] Verify uploads (image/file) and GIF picker work under new theme
- [ ] Verify theme toggle persists on reload and across routes
- [ ] Sweep for leftover placeholder text, debug logs, or dead imports
- [ ] Final screenshot pass for portfolio
