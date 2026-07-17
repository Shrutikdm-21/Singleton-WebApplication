# ZeroThreat Test App — Single Tab Session Demo

A Node.js + Express demonstration application that implements single browser tab session management with a realistic online banking interface, similar to the behavior used by some banking applications.

⚠️ **WARNING**: This is a DEMO application for security scanner and session-management testing purposes only. DO NOT use this pattern in production without proper security implementation.

## Features

- **Single-Tab Enforcement**: Only one browser tab can be active per session across all pages
- **Automatic Tab Invalidation**: When a second tab opens, the first tab is automatically logged out
- **Client-Side Heartbeat**: Polls every 3 seconds to check tab validity
- **In-Memory Sessions**: Simple session management without database dependencies
- **HttpOnly Cookies**: Session cookies are protected from client-side JavaScript access
- **Multiple Banking Pages**: Realistic banking interface with 7 protected pages
- **Shared Navigation**: Consistent navigation bar across all protected pages

## Installation

```bash
npm install
```

## Running the Application

```bash
node server.js
```

The server will start on `http://localhost:3000`

## Login Credentials

**Username:** `Admin`  
**Password:** `Admin@123`

## How to Test

1. Open `http://localhost:3000/login` in your browser
2. Login with the test credentials:
   - **Username:** `Admin`
   - **Password:** `Admin@123`
3. You'll be redirected to the dashboard
4. **Navigate through the banking pages** using the top navigation menu:
   - **Dashboard** - Overview and demo information
   - **Accounts** - View dummy bank accounts
   - **Transactions** - View transaction history
   - **Cards** - View debit/credit cards
   - **Payments** - Transfer funds demo
   - **Beneficiaries** - View saved beneficiaries
   - **Profile** - View customer information
5. **Duplicate any browser tab** (Ctrl+Shift+T or right-click → Duplicate)
6. Watch what happens to the **first tab** after 3-5 seconds
7. The first tab will automatically redirect to login with message: "Session expired — opened in another tab"

## How It Works

### Session Flow

```
User opens /login
    ↓
Enters credentials
    ↓
Server generates:
  - sessionId (stored in HttpOnly cookie)
  - activeTabToken (stored in session)
    ↓
User redirected to /dashboard
    ↓
Dashboard loads and:
  - Generates NEW tab token
  - Replaces old token in session
  - Embeds new token in page
    ↓
Client JavaScript polls /session-check every 3 seconds
    ↓
If token doesn't match (another tab opened):
  - Server returns 401
  - Client redirects to /login
```

### Key Implementation Details

1. **Session Creation** (`POST /login`):
   - Generates unique session ID
   - Generates initial tab token
   - Stores both in memory
   - Sets HttpOnly cookie

2. **Single-Tab Enforcement** (`GET /dashboard`):
   - **Each time dashboard loads**, generates a NEW tab token
   - Replaces the stored `activeTabToken` in the session
   - This invalidates all previously opened tabs
   - Newest tab always wins

3. **Heartbeat Validation** (`GET /session-check`):
   - Client sends its tab token in `X-Tab-Token` header
   - Server compares against current `activeTabToken`
   - Returns 200 OK if match (tab still active)
   - Returns 401 Unauthorized if mismatch (tab replaced)

4. **Client-Side Polling**:
   - JavaScript polls `/session-check` every 3 seconds
   - On 401 response, redirects to login page
   - Displays message: "Session expired — opened in another tab"

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/login` | Display login page |
| POST | `/login` | Process login and create session |
| GET | `/dashboard` | Protected dashboard page |
| GET | `/accounts` | View bank accounts with balances |
| GET | `/transactions` | View transaction history |
| GET | `/cards` | View debit/credit cards |
| GET | `/payments` | Transfer funds demo page |
| GET | `/beneficiaries` | View saved beneficiaries |
| GET | `/profile` | View customer profile information |
| GET | `/session-check` | Heartbeat endpoint for tab validation |
| GET | `/logout` | Destroy session and redirect to login |
| GET | `/` | Root redirect to dashboard or login |

## Session Data Structure

```javascript
sessions = {
  "sessionId123...": {
    username: "testuser",
    activeTabToken: "token456...",
    createdAt: Date
  }
}
```

## Security Notes

This is a **DEMO APPLICATION** for testing purposes:

- ✅ Demonstrates single-tab session concept
- ✅ Uses HttpOnly cookies
- ✅ Shows token-based tab validation
- ❌ Accepts any username/password
- ❌ Uses in-memory storage (sessions lost on restart)
- ❌ No password hashing
- ❌ No CSRF protection
- ❌ No rate limiting
- ❌ No HTTPS enforcement

**For production use, you would need:**
- Real authentication with password hashing
- Persistent session storage (Redis, database)
- CSRF protection
- Rate limiting
- HTTPS/TLS
- Input validation and sanitization
- Security headers
- Audit logging

## Files

- `server.js` - Main application code
- `package.json` - Node.js dependencies
- `README.md` - This file

## Dependencies

- `express` - Web framework
- `cookie-parser` - Cookie parsing middleware

## License

ISC - This is demonstration code for testing purposes.
