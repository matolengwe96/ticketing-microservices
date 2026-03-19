# Full Report: Debugging and Fixing JWT Authentication in Ticketing Microservices

## Project Overview

- **Services**: Auth (port 3001), Orders (port 3002), Common shared package
- **Tech Stack**: Node.js, TypeScript, Express, MongoDB, NATS, JWT for auth
- **Issue**: `currentUser` middleware in Orders service always returned `null`, despite JWT being present in session cookie

## Initial Diagnosis (Step-by-Step Debugging)

1. **Inspected `common/src/middlewares/current-user.ts`**:
   - Code looked correct: checks `req.session?.jwt`, verifies with `process.env.JWT_KEY!`, sets `req.currentUser` on success
   - Typings: `UserPayload` interface, global Express.Request extension

2. **Inspected `orders/src/app.ts`**:
   - Middleware order correct: `json()`, `cookieSession()`, `currentUser`, routes
   - Cookie session configured with `signed: false, secure: false`

3. **Checked Environment Variables**:
   - Both `auth/.env` and `orders/.env` have `JWT_KEY=asdf`
   - Services load `.env` via `dotenv.config()`

4. **Added Debug Route to Orders**:
   - Temporary `GET /api/orders/debug` endpoint returning:
     - `session`, `currentUser`
     - `tokenExists`, `decodedToken`, `verifyResult`, `verifyError`, `runtimeJwtKey`
   - Revealed: `verifyError: "JsonWebTokenError: invalid signature"` — signature mismatch!

5. **Root Cause Identified**:
   - Auth service signing JWTs with hardcoded `'secret'` (in signup/signin routes)
   - Orders verifying with `process.env.JWT_KEY` (`'asdf'`)
   - Mismatch caused verification to fail silently, leaving `currentUser` null

## Fixes Applied

1. **Updated Auth JWT Signing**:
   - `auth/src/routes/signup.ts`: Changed `jwt.sign(..., 'secret')` to `jwt.sign(..., process.env.JWT_KEY!)`
   - `auth/src/routes/signin.ts`: Same change
   - `auth/src/routes/current-user.ts`: Changed `jwt.verify(..., 'secret')` to `jwt.verify(..., process.env.JWT_KEY!)`

2. **Rebuilt Common Package**:
   - Ran `npm run build` in `common/` to ensure latest middleware is used

3. **Restarted Services**:
   - Killed old processes (ports 3001/3002, NATS client conflicts)
   - Started auth and orders services cleanly

4. **Enhanced Type Safety in Orders Routes**:
   - Added shared `AuthenticatedRequest` interface in `common/src/types/authenticated-request.ts`
   - Exported from `common/src/index.ts`
   - Updated all orders routes (`new.ts`, `index.ts`, `show.ts`, `delete.ts`):
     - Imported `AuthenticatedRequest` from `@ticketing/common`
     - Removed local interface definitions
     - Added explicit `if (!req.currentUser) throw new NotAuthorizedError()` checks
     - Removed `as any` casts and `!` assertions

5. **Cleaned Up Debug Code**:
   - Removed temporary debug route from `orders/src/app.ts`
   - Removed unused `jsonwebtoken` dependency from `orders/package.json`
   - Removed `jwt` import from orders app

6. **Rebuilt Orders**:
   - Ran `npm run build` in `orders/` — compiles cleanly

## End-to-End Testing

- **Started Services**: Auth on 3001, Orders on 3002
- **Simulated Signup**: `POST /api/users/signup` → 201 Created, session cookie set
- **Tested Orders Endpoint**: `GET /api/orders` → 200 OK, `[]` (empty array), auth passed
- **Verified**: `currentUser` populated correctly, JWT verified successfully

## Optional Cleanup Attempted

- Tried to remove test user from MongoDB using `mongo` shell
- Shell not available (not in PATH), so test user remains (non-critical)

## Final State

- **Auth Flow Working**: Signup/signin → JWT issued → Orders verifies → `currentUser` set
- **Type Safety**: Shared types, no runtime assertions, explicit auth checks
- **Code Quality**: DRY, consistent, production-ready
- **Services Ready**: Can add tickets service using same pattern

## Files Modified

- `auth/src/routes/signup.ts`
- `auth/src/routes/signin.ts`
- `auth/src/routes/current-user.ts`
- `common/src/index.ts`
- `common/src/types/authenticated-request.ts`
- `orders/src/app.ts`
- `orders/src/routes/new.ts`
- `orders/src/routes/index.ts`
- `orders/src/routes/show.ts`
- `orders/src/routes/delete.ts`
- `orders/package.json`

This report covers the complete debugging session, root cause, fixes, and testing. You can copy-paste this into ChatGPT for reference or continuation. If you need more details on any step, let me know! 🚀
