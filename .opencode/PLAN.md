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
- [x] Add `images.remotePatterns` for S3 media bucket and Giphy domains

### 0.5 Debug cleanup
- [x] Remove `console.log`s in `components/chat/conversation-list.tsx`, `components/ui/user-card.tsx`, `components/user/settings-dialog/`
- [x] Sweep grep for any remaining `console.log`/`console.error` in feature code (all `console.log`/debug removed; single `console.error` per error site retained until Phase 4.2 converts them to toasts)
- [x] Keep `TEST_EMAILS` protection in `components/user/settings-dialog/change-password.tsx` (user decision — test-account password changes stay disabled; revisit for demo account in Phase 5)

---

## Phase 1 — Landing Page (`src/app/page.tsx`)

### 1.0 Dependencies & scaffolding
- [x] Add prod deps: `three`, `@react-three/fiber@^9`, `@react-three/drei@^10`, `motion` (Framer Motion current package name); dev: `@types/three` (all React 19 / Next 16 compatible)
- [x] Create `src/components/landing/` directory; all landing sub-components live here

### 1.1 Top nav (`components/landing/top-nav.tsx`)
- [x] Slim sticky top nav: brand logo (link to `/`) + Sign In / Create Account links (right), responsive (condensed/collapsible on mobile)
- [x] Show "Dashboard" link instead when server-side auth check passes

### 1.2 Animated hero — 3D scene (`components/landing/hero-scene.tsx`, client)
- [x] r3f `<Canvas>` with drei `Stars`, violet nebula glow sprites driven by `--cosmic-glow-*` tokens
- [x] Two floating orbs (wireframe + solid, `--primary` color, drei `Float`) drifting slowly
- [x] Faint particle-stream arc between the orbs (message crossing a language barrier) — stream endpoints use the orbs' live positions, so the string drifts with the orbs
- [x] Theme-reactive: read CSS vars so scene shifts with dark/light mode; theme-aware blending (additive on dark, normal on light) so the scene stays legible in light mode without new colors
- [x] Respect `prefers-reduced-motion` (orbs freeze, rotation stops)
- [x] Load via `next/dynamic(..., { ssr: false })` behind a CSS gradient/starry `Suspense` fallback — no SSR/WebGL issues, no LCP penalty
- [x] WebGL unavailable (e.g. hardware acceleration off): render CSS cosmic backdrop + dismissible banner prompting the user to enable WebGL — no JS permission prompt API exists for WebGL, so we guide rather than try to auto-request

### 1.3 Animated hero — content + translation demo (`hero-content.tsx`, `translation-demo.tsx`, client)
- [x] `motion` staggered entrance for `text-brand-gradient` headline + one-line value prop
- [x] Translation demo (DOM overlay, readable): chat bubble auto-cycles EN → ES → FR → JA (reuse `LANGUAGES`), morph/burst between languages, pauses between cycles, respects reduced motion
- [x] Primary CTAs: Sign In, Create Account (Try-demo CTA added in Phase 5)
- [x] Keep the server-side auth check (logged-in users see "Dashboard" instead)

### 1.6 Footer (`components/landing/footer.tsx`)
- [x] Footer with GitHub source link, theme toggle, minimal brand treatment

### 1.7 Page assembly (`src/app/page.tsx`)
- [x] Assemble nav → hero (Suspense + lazy scene) → footer in correct order
- [x] Verify build clean (`npm run build:web`), zero new lint errors, browser check: WebGL mount, auto-cycle timing, dark/light reactivity, reduced motion

---

## Phase 2 — Auth Screens

### 2.1 Shared auth layout
- [x] Create a shared split-screen auth layout/component: branded panel (gradient, logo, feature bullets) + form card on the right
- [x] Make split-screen responsive (branded panel hidden/condensed on mobile, stacked layout)

### 2.2 Login (`src/app/login/page.tsx`)
- [x] Rework form into brand-styled card (labels, inputs, focus rings per new tokens)
- [x] Add show/hide password toggle
- [x] Add "Forgot password" flow (`lib/auth.ts`: `resetPassword` + `confirmResetPassword`; UI: email → code + new password views)
- [x] Wire forgot-password success/error to inline states (or Phase 4 toast)
- [x] Add "Try demo" link (Phase 5)
- [x] Add "Don't have an account? Sign up" swap link (keep)

### 2.3 Signup (`src/app/signup/page.tsx`)
- [x] Rework register view into brand-styled card
- [x] Add show/hide password toggle
- [x] Add inline password-strength hint
- [x] Rework email-verification (code) step with brand styling
- [x] Add **Resend code** button (`resendSignUpCode` in Amplify)
- [x] Add auto-focus + enter-to-submit on code input
- [x] Verify Cognito pool settings allow `resend`/`reset`; add note to `docs/` if pool config change is needed

---

## Phase 3 — Dashboard Shell & Mobile Responsiveness

### 3.0 Prereq (DONE)
- Middleware prefix-match protects `/dashboard/*`; `useRequireAuth` in `dashboard/layout.tsx` redirects logged-out users and renders `null` until the session resolves. Phase 3 layout changes must keep this guard mounted first.

### 3.1 Nav rail (`src/app/dashboard/layout.tsx`, `src/components/ui/sidebar-button.tsx`)
- [x] Brand styling: switch rail from raw `bg-muted border-r border-border` to `--sidebar-*` tokens (`bg-sidebar text-sidebar-foreground`, `border-sidebar-border`), plus cosmic glass treatment (subtle `bg-sidebar/70 backdrop-blur`, gradient hairline on the right edge)
- [x] Active state: keep squircle→pill morph in `SideBarButton` but restyle with brand tokens — inactive `text-sidebar-foreground/70`, active `rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground`, hover `bg-sidebar-accent`; keep `TooltipProvider` + `Tooltip side="right"`
- [x] Responsive: rail is `w-16` at `md+`, `hidden` below `md` (`hidden md:flex`); root container `h-screen` → `h-dvh` (iOS URL-bar overlap)
- [x] Unread badge (nav level): new `useUnreadChatCount()` hook — `useChats()` + `isUnread` memoized count of unread conversations (reuses shared `CHAT_QUERY_KEYS.chats` cache, no extra fetches; per-message total out of scope); tiny badge (`min-w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground`) on the DMs `SideBarButton`; updates live via existing subscription invalidation
- [x] `SideBarButton`: add optional `badge?: number` and `hideTooltip?: boolean` props (mobile bottom bar reuses it without tooltips)

### 3.2 Mobile bottom tab bar (new `src/components/dashboard/mobile-bottom-bar.tsx`)
- [x] Fixed bottom bar, `md:hidden`: brand `BrandMark` mini-icon left, nav items (DMs — reuses `SideBarButton` with `hideTooltip`), spacer, add-friend quick action (opens `AddFriendDialog`), right: profile avatar that reuses the existing `UserProfileCard` popover
- [x] Safe area: `pb-[env(safe-area-inset-bottom)]` + `h-16` content row; add `md:hidden` bottom padding to root layout so content never hides behind the bar
- [x] Active state: highlight DMs when `pathname.startsWith("/dashboard/dm")`
- [x] Keep the rail's `pb-14` clearance only on desktop (profile card lives there)

### 3.3 Mobile top header (new `src/components/dashboard/mobile-header.tsx`)
- [x] `md:hidden` slim header above content: hamburger button (opens the DM drawer), app title/wordmark, `ThemeToggle iconOnly`; no header on desktop (rail + rail profile menu cover it)
- [x] Header sits inside the flex column; on mobile the chat panel + input render below it

### 3.4 DM sidebar → mobile drawer (`src/components/ui/drawer.tsx` new; refactor `dm-sidebar.tsx`, `dm/page.tsx`)
- [x] New `components/ui/sheet.tsx`: left slide-in sheet built on Base UI `dialog` (Portal/Backdrop/Popup with `slide-in-from-left-full`/`slide-out-to-left-full`, styled backdrop `bg-background/60 backdrop-blur-sm`, respect `usePrefersReducedMotion`)
- [x] `DMSidebar`: add optional `className`; desktop `w-60` 2-pane unchanged; on mobile the same component renders inside `SheetContent` at `w-[85vw] max-w-xs`
- [x] `dm/page.tsx`: mobile only — hamburger (in `MobileHeader`) opens the drawer; selecting a chat or friend calls `onSelectChat`/`onSelectFriend` **and closes the drawer**; desktop 2-pane unchanged
- [ ] Swipe: `Drawer.SwipeArea` (edge swipe) — not implemented (sheet is Dialog-based; optional touch-gesture open enhancement)
- [x] Auto-open drawer on mobile first load when no chat is active
- [x] `AddFriendDialog` stays reachable at the drawer's top (`dm-sidebar.tsx` already renders it)

### 3.5 Responsive widths/breakpoints audit
- [x] `dm-sidebar.tsx` `w-60` → keep for `md+`; drawer width handles mobile (see 3.4)
- [x] `user-profile-card.tsx` `w-68` + `absolute bottom-4 left-3` → desktop-only placement (`hidden md:block`); on mobile profile entry moves into bottom bar (3.2)
- [x] `gif-picker.tsx` `w-80 h-80` → `w-80 max-w-[calc(100vw-2rem)]` (can't overflow 320–390px)
- [x] `popover.tsx` `w-72` → add `max-w-[calc(100vw-2rem)]` generic guard (GifPicker/message-input popovers on small screens)
- [x] Confirm `AlertDialog` (logout confirm) and settings `sm:max-w-md` open inside viewport at 320px — AlertDialog `w-full max-w-xs` fits; settings dialog was taller than the viewport at 320×568 (top -30, close button off-screen) → base `DialogContent` now `max-h-[calc(100dvh-2rem)] overflow-y-auto`; re-verified: dialog fully contained (top 16/bottom 552), scrolls, close button visible
- [x] Verify `message-list` bubbles (`max-w-[70%]`) and input row don't overflow at 320px — bubbles max right 304px, input bottom 492px, no horizontal scroll

---

## Phase 4 — Chat & Messaging Polish

### 4.1 Skeletons & loading
- [x] Create `components/ui/skeleton.tsx` (shimmer on brand tokens) — `Skeleton` (shimmer-sweep overlay via `--shimmer-sheen` brand token, plain CSS class + keyframe in globals.css), `ListSkeleton` (avatar + 2-line rows), `MessageListSkeleton` (alternating own/other bubbles)
- [x] Replace "Loading…" and "Loading messages…" text in `conversation-list.tsx`, `friends-list.tsx`, `message-list.tsx`, request lists
- [x] Add skeleton rows for conversation/friend lists and message bubbles
- [x] Fix `empty-state.tsx` semantic bug (currently used for both loading AND empty) — loading now uses skeletons; `EmptyState` is only for empty/error states (doc updated)

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
