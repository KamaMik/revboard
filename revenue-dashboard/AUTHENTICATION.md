# Authentication Documentation

This project uses **Supabase Auth** combined with **Next.js Server Side Rendering (SSR)** to provide a secure and robust authentication system. This document outlines the architecture, flows, and security measures implemented.

> **Note on OAuth 2.1 Server**: The link you provided (`https://supabase.com/docs/guides/auth/oauth-server/token-security`) refers to Supabase's capability to act as an OAuth Provider (like "Sign in with Google" but for your app). **We are NOT using this flow.**
>
> Instead, we are using the **Standard Supabase Auth Flow** for a first-party application. This means users log in directly to our app using Supabase as the backend service, rather than our app acting as an identity provider for third-party apps.
>
> However, the underlying security principles (JWT tokens, RLS, Secure Cookies) are the same. We use the `authenticated` role claim to secure data, which is the standard practice for this type of application.

## Architecture Overview

The authentication system is built using the `@supabase/ssr` package, which allows us to manage sessions securely across Client Components, Server Components, and Server Actions.

### Key Components

1.  **Middleware (`middleware.ts`)**
    *   Acts as the gatekeeper for the application.
    *   Runs on every request (except static assets).
    *   Refreshes the Supabase session to keep it active.
    *   Protects routes: If a user is not authenticated and tries to access protected pages (like the dashboard `/`), they are redirected to `/login`.

2.  **Supabase Clients (`lib/supabase/`)**
    *   **`client.ts`**: Creates a client for **Client Components**. It runs in the browser and accesses cookies directly.
    *   **`server.ts`**: Creates a client for **Server Components** and **Server Actions**. It uses Next.js `cookies()` API to read and write session cookies securely on the server.

3.  **Login Page (`app/login/page.tsx`)**
    *   A simple UI with Email and Password fields.
    *   Provides two buttons: "Accedi" (Login) and "Registrati" (Sign Up).
    *   Uses Server Actions to handle form submissions.

4.  **Server Actions (`app/login/actions.ts`)**
    *   **`login`**: Authenticates the user with Supabase using `signInWithPassword`. On success, redirects to the dashboard.
    *   **`signup`**: Creates a new user with `signUp`. On success, redirects to the dashboard (or awaits email confirmation if enabled in Supabase).

5.  **Auth Callback (`app/auth/callback/route.ts`)**
    *   Handles the callback from OAuth providers (e.g., Google, GitHub) or Email Magic Links.
    *   Exchanges the temporary `code` for a valid user session.
    *   Redirects the user back to the intended page.

## Authentication Flows

### 1. User Login Flow
1.  User visits `/login`.
2.  Enters credentials and clicks "Accedi".
3.  The form submits to the `login` Server Action.
4.  The server validates credentials with Supabase.
5.  If valid, Supabase sets a session cookie.
6.  User is redirected to `/`.

### 2. Session Management (Middleware)
1.  On every navigation, `middleware.ts` runs.
2.  It creates a Supabase client and calls `getUser()`.
3.  **If Session exists**: The request proceeds. The middleware also ensures the session cookie is refreshed if it's close to expiring.
4.  **If No Session**:
    *   If the user is on a protected route (e.g., `/`), they are redirected to `/login`.
    *   If the user is on a public route (e.g., `/login`), they can proceed.

### 3. Data Access (Row Level Security)
Authentication is not just about logging in; it's about securing data. We use PostgreSQL **Row Level Security (RLS)** to enforce permissions at the database level.

*   **API Routes**: All API routes (`/api/incassi`, etc.) now use `createClient()` from `lib/supabase/server.ts`. This ensures that every database query is made in the context of the logged-in user.
*   **RLS Policies**: The database policies (defined in `supabase/secure_policy.sql`) explicitly state:
    *   `SELECT`, `INSERT`, `UPDATE`, `DELETE`: Allowed **only** for `authenticated` users.
    *   `anon` (anonymous) users have **no access** to the `incassi` table.

## Security Features

*   **HttpOnly Cookies**: Session tokens are stored in HttpOnly cookies, making them inaccessible to client-side JavaScript (protecting against XSS attacks).
*   **PKCE Flow**: The auth callback uses Proof Key for Code Exchange (PKCE) for enhanced security during the token exchange.
*   **Server-Side Validation**: All authentication logic happens on the server, preventing client-side manipulation.
*   **Database-Level Protection**: Even if an API endpoint were accidentally exposed, the database itself would reject queries from unauthenticated users due to RLS.

## How to Test

1.  **Access Dashboard**: Try to visit `http://localhost:3000/`. You should be redirected to `/login`.
2.  **Login**: Enter valid credentials. You should be redirected to the dashboard.
3.  **Verify Data**: You should see data loaded.
4.  **Logout**: (Feature to be implemented in UI, but you can clear cookies to test).
5.  **API Check**: Try to make a `POST` request to `/api/incassi` using Postman without cookies. It should fail (401/400 or empty response depending on handling).
