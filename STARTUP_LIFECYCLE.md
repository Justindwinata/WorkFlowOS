# Application Startup Lifecycle

## Overview

WorkFlowOS implements a session-aware bootstrap flow that automatically routes users based on their authentication state.

## Startup States

The authentication system uses three explicit states:

- `checking` — initial state, verifying session from localStorage
- `authenticated` — user is logged in with valid token
- `unauthenticated` — no valid session exists

## Startup Flow

### 1. Root Entry (`/`)

When a user opens the application:

1. **AuthProvider initializes** in `apps/web/src/components/auth/AuthProvider.tsx`
   - Calls `refreshUser()` to verify stored token
   - Shows loading spinner while checking

2. **Root page** (`apps/web/src/app/page.tsx`) observes auth status
   - While `status === 'checking'`: displays BootSplash with "Memverifikasi sesi..."
   - When `status === 'authenticated'`: redirects to `/dashboard`
   - When `status === 'unauthenticated'`: redirects to `/login`

### 2. Session Verification

**Without Token:**
```
localStorage.getItem('accessToken') → null
→ status = 'unauthenticated'
→ redirect to /login
```

**With Valid Token:**
```
GET /auth/me (with Bearer token)
→ success
→ status = 'authenticated'
→ redirect to /dashboard
```

**With Expired/Invalid Token:**
```
GET /auth/me (with Bearer token)
→ fail (401/error)
→ localStorage cleared
→ status = 'unauthenticated'
→ initError set (recoverable)
→ BootSplash shows retry button
```

### 3. Authentication Pages

**Login & Register Guard (`useRedirectIfAuthenticated` hook):**
- If user is already authenticated, immediately redirects to `/dashboard`
- Prevents logged-in users from re-accessing auth pages

### 4. Dashboard Access

**Protected by `DashboardLayout`:**
- Checks `isAuthenticated` status
- If false: redirects to `/login`
- If true: renders dashboard shell with sidebar, topbar, content

## Error Recovery

If session verification fails:

1. BootSplash displays error message
2. User sees "Coba Lagi" (Retry) button
3. Clicking retry calls `refreshUser()` again
4. On success, error clears and user redirects to `/dashboard`
5. On continued failure, user can manually navigate to `/login`

## State Machine Transitions

```
┌─────────────┐
│  checking   │  (initial, during verification)
└──────┬──────┘
       │
       ├─→ (token valid) → authenticated ──→ /dashboard
       │
       └─→ (no token or invalid) → unauthenticated ──→ /login
                                  (with optional initError)
```

## Session Persistence

- Access token stored in `localStorage`
- Persists across page refreshes
- Automatically cleared on logout or token expiry
- API client automatically refreshes expired tokens via `POST /auth/refresh`

## First-Time User Flow

1. User opens application → `/`
2. No token found → redirects to `/login`
3. User enters credentials
4. Successful login → token stored → `/dashboard`
5. Dashboard loads with user data

## Returning User Flow

1. User opens application → `/`
2. Token found and valid → `/dashboard` (auto-login)
3. Dashboard loads immediately

## Logout Flow

1. User clicks logout button
2. `POST /auth/logout` called (clears server session)
3. localStorage cleared
4. Status set to `unauthenticated`
5. Redirect to `/login`
6. Next `/` visit goes to `/login` (no token)

## Key Files

- `apps/web/src/lib/auth-store.ts` — Zustand store with status state machine
- `apps/web/src/components/BootSplash.tsx` — Loading/error splash component
- `apps/web/src/app/page.tsx` — Root bootstrap page with session-aware routing
- `apps/web/src/components/auth/AuthProvider.tsx` — Session verification trigger
- `apps/web/src/hooks/useRedirectIfAuthenticated.ts` — Guard for auth pages
- `apps/web/src/app/error.tsx` — Global error boundary with retry

## Testing

Run E2E startup scenarios:

```bash
npm run test:e2e -- src/e2e/startup.e2e.ts
```

Tests verify:
- Unauthenticated users redirect to `/login`
- Authenticated users redirect to `/dashboard`
- Session persists after refresh
- Logged-in users cannot access `/login` or `/register`
- Logout clears session