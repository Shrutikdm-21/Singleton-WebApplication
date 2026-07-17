/**
 * ZeroThreat Test App — Single Tab Session Demo
 * 
 * This application demonstrates single-tab session management
 * for security scanner and session-management testing purposes.
 * 
 * ⚠️ WARNING: This is a DEMO application for testing only.
 * DO NOT use this pattern in production without proper security implementation.
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// In-memory session store
// Structure: { sessionId: { username, activeTabToken, createdAt } }
const sessions = {};

/**
 * Generate a unique random token
 * Used for both session IDs and tab tokens
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Retrieve session from cookie
 * Returns session object or null if invalid
 */
function getSession(req) {
  const sessionId = req.cookies.sessionId;
  if (!sessionId || !sessions[sessionId]) {
    return null;
  }
  return sessions[sessionId];
}

/**
 * Generate shared CSS styles for all protected pages
 */
function getSharedStyles() {
  return `
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .navbar {
      background-color: #007bff;
      padding: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .navbar ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
    }
    .navbar li {
      margin: 0;
    }
    .navbar a {
      display: block;
      color: white;
      text-decoration: none;
      padding: 15px 20px;
      transition: background-color 0.3s;
    }
    .navbar a:hover {
      background-color: #0056b3;
    }
    .navbar a.active {
      background-color: #0056b3;
      font-weight: bold;
    }
    .container {
      max-width: 1200px;
      margin: 30px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-top: 0;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }
    h2 {
      color: #555;
      margin-top: 25px;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
      margin-left: 10px;
      font-size: 12px;
    }
    .status.active {
      background-color: #28a745;
      color: white;
    }
    .status.expired {
      background-color: #dc3545;
      color: white;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #007bff;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    tr:hover {
      background-color: #f8f9fa;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
      background-color: #f8f9fa;
    }
    .card h3 {
      margin-top: 0;
      color: #007bff;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge.success {
      background-color: #28a745;
      color: white;
    }
    .badge.warning {
      background-color: #ffc107;
      color: #333;
    }
    .badge.danger {
      background-color: #dc3545;
      color: white;
    }
    .badge.info {
      background-color: #17a2b8;
      color: white;
    }
    form {
      max-width: 600px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #333;
    }
    input, select, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 14px;
    }
    button, .btn {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    }
    button:hover, .btn:hover {
      background-color: #0056b3;
    }
    button:disabled, .btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    .success-message {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .info-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      width: 200px;
      color: #555;
    }
    .info-value {
      flex: 1;
      color: #333;
    }
  `;
}

/**
 * Generate navigation bar HTML
 * @param {string} activePage - Current active page
 */
function getNavbar(activePage) {
  const pages = [
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Accounts', url: '/accounts' },
    { name: 'Transactions', url: '/transactions' },
    { name: 'Cards', url: '/cards' },
    { name: 'Payments', url: '/payments' },
    { name: 'Beneficiaries', url: '/beneficiaries' },
    { name: 'Profile', url: '/profile' },
    { name: 'Logout', url: '/logout' }
  ];
  
  const navItems = pages.map(page => {
    const activeClass = page.name === activePage ? 'active' : '';
    return `<li><a href="${page.url}" class="${activeClass}">${page.name}</a></li>`;
  }).join('');
  
  return `
    <nav class="navbar">
      <ul>
        ${navItems}
      </ul>
    </nav>
  `;
}

/**
 * Generate the heartbeat JavaScript
 * This is included on all protected pages to check tab validity
 */
function getHeartbeatScript() {
  return `
    // Read the tab token from the meta tag
    const tabToken = document.querySelector('meta[name="tab-token"]').content;
    console.log('Tab token:', tabToken.substring(0, 8) + '...');
    
    /**
     * Heartbeat function
     * Polls /session-check every 3 seconds to verify this tab is still active
     * If the token is invalid (replaced by another tab), redirect to login
     */
    async function checkSession() {
      try {
        const response = await fetch('/session-check', {
          headers: {
            'X-Tab-Token': tabToken
          }
        });
        
        const data = await response.json();
        
        if (response.status === 401 || data.status === 'expired') {
          // Token has been replaced by another tab
          console.warn('Session expired - another tab is now active');
          const statusEl = document.getElementById('status');
          if (statusEl) {
            statusEl.textContent = 'EXPIRED';
            statusEl.className = 'status expired';
          }
          
          // Redirect to login after a brief moment
          setTimeout(() => {
            window.location.href = '/login?reason=another-tab';
          }, 500);
        } else if (data.status === 'ok') {
          console.log('Session active');
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    }
    
    // Start polling immediately
    checkSession();
    
    // Poll every 3 seconds
    const heartbeatInterval = setInterval(checkSession, 3000);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(heartbeatInterval);
    });
  `;
}

/**
 * Render a protected page with shared layout
 * This function handles:
 * - Session validation
 * - Tab token generation (single-tab enforcement)
 * - Shared navbar
 * - Shared styles
 * - Heartbeat polling script
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {string} pageTitle - Page title (will be prefixed with "ZeroThreat Test App — ")
 * @param {string} activePage - Active page name for navbar highlighting
 * @param {string} content - HTML content for the page body
 */
function renderProtectedPage(req, res, pageTitle, activePage, content) {
  const session = getSession(req);
  
  if (!session) {
    return res.redirect('/login');
  }
  
  // CRITICAL: Generate a NEW tab token for this tab
  // This is the single-tab enforcement mechanism
  const newTabToken = generateToken();
  
  // Replace the active tab token in the session
  // This invalidates all other tabs holding the old token
  const oldToken = session.activeTabToken;
  session.activeTabToken = newTabToken;
  
  console.log(`[${activePage.toUpperCase()}] User "${session.username}" opened page. New tab token generated.`);
  console.log(`            Old token: ${oldToken.substring(0, 8)}... (now invalid)`);
  console.log(`            New token: ${newTabToken.substring(0, 8)}... (now active)`);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ZeroThreat Test App — ${pageTitle}</title>
      <!-- Embed the tab token in a meta tag -->
      <meta name="tab-token" content="${newTabToken}">
      <style>
        ${getSharedStyles()}
      </style>
    </head>
    <body>
      ${getNavbar(activePage)}
      <div class="container">
        ${content}
      </div>
      
      <script>
        ${getHeartbeatScript()}
      </script>
    </body>
    </html>
  `);
}

/**
 * GET /login
 * Display login page with username/password fields
 */
app.get('/login', (req, res) => {
  const reason = req.query.reason || '';
  const error = req.query.error || '';
  let message = '';
  
  if (reason === 'another-tab') {
    message = '<div style="color: red; font-weight: bold; margin-bottom: 15px;">⚠️ Session expired — opened in another tab.</div>';
  } else if (error === 'invalid') {
    message = '<div style="color: red; font-weight: bold; margin-bottom: 15px;">❌ Invalid username or password. Please try again.</div>';
  } else if (error === 'missing') {
    message = '<div style="color: red; font-weight: bold; margin-bottom: 15px;">❌ Please enter both username and password.</div>';
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ZeroThreat Test App — Single Tab Session Demo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          margin-top: 0;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          color: #856404;
        }
        .credentials-box {
          background-color: #d1ecf1;
          border: 1px solid #bee5eb;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          color: #0c5460;
        }
        .credentials-box strong {
          color: #004085;
        }
        input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          padding: 12px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>ZeroThreat Test App</h1>
        <h2>Single Tab Session Demo</h2>
        
        <div class="warning">
          ⚠️ <strong>DEMO APPLICATION</strong><br>
          This application is a demonstration for testing only and is not a secure authentication implementation.
          Do not use this pattern in production without proper security measures.
        </div>
        
        ${message}
        
        <div class="credentials-box">
          <strong>Test Credentials:</strong><br>
          Username: <strong>Admin</strong><br>
          Password: <strong>Admin@123</strong>
        </div>
        
        <form method="POST" action="/login">
          <input type="text" name="username" placeholder="Username" required>
          <input type="password" name="password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

/**
 * POST /login
 * Process login request
 * - Validate credentials (username: Admin, password: Admin@123)
 * - Generate unique session ID
 * - Generate initial tab token
 * - Store session in memory
 * - Set HttpOnly cookie
 * - Redirect to dashboard
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate credentials
  if (!username || !password) {
    return res.redirect('/login?error=missing');
  }
  
  // Check for specific credentials
  if (username !== 'Admin' || password !== 'Admin@123') {
    console.log(`[LOGIN] Failed login attempt - Username: "${username}"`);
    return res.redirect('/login?error=invalid');
  }
  
  // Generate unique session ID
  const sessionId = generateToken();
  
  // Generate initial tab token
  const activeTabToken = generateToken();
  
  // Store session in memory
  sessions[sessionId] = {
    username: username,
    activeTabToken: activeTabToken,
    createdAt: new Date()
  };
  
  console.log(`[LOGIN] User "${username}" logged in successfully. Session: ${sessionId.substring(0, 8)}...`);
  
  // Set HttpOnly session cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  // Redirect to dashboard
  res.redirect('/dashboard');
});

/**
 * GET /dashboard
 * Main dashboard page
 * Now uses shared layout with single-tab enforcement
 */
app.get('/dashboard', (req, res) => {
  const session = getSession(req);
  
  const content = `
    <h1>Welcome, ${session.username}! 👋</h1>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px; color: #856404;">
      ⚠️ <strong>DEMO APPLICATION</strong><br>
      This is a demonstration for testing single-tab session management.
    </div>
    
    <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 20px 0; color: #0c5460;">
      <h3>Single-Tab Session Demo</h3>
      <p>
        This application enforces a single active browser tab per session.
        When you open this page in a second tab, the first tab will be automatically logged out.
      </p>
      <p>
        <strong>Try it:</strong> Duplicate this tab (Ctrl+Shift+T or right-click → Duplicate).
        Watch what happens to this tab after a few seconds!
      </p>
      <p>
        Session Status: <span class="status active" id="status">ACTIVE</span>
      </p>
    </div>
    
    <h2>How It Works</h2>
    <ul>
      <li>Each session has exactly one active tab token</li>
      <li>When a new tab loads any protected page, it gets a new token</li>
      <li>The old tab's token becomes invalid</li>
      <li>Client-side polling checks token validity every 3 seconds</li>
      <li>Invalid tabs are automatically redirected to login</li>
    </ul>
    
    <h2>Explore the Banking Demo</h2>
    <p>Navigate through the menu above to explore different banking features. Each page demonstrates the single-tab session enforcement.</p>
  `;
  
  renderProtectedPage(req, res, 'Dashboard', 'Dashboard', content);
});

/**
 * GET /dashboard
 * Main dashboard page
 * Now uses shared layout with single-tab enforcement
 */
app.get('/dashboard', (req, res) => {
  const session = getSession(req);
  
  const content = `
    <h1>Welcome, ${session.username}! 👋</h1>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px; color: #856404;">
      ⚠️ <strong>DEMO APPLICATION</strong><br>
      This is a demonstration for testing single-tab session management.
    </div>
    
    <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 20px 0; color: #0c5460;">
      <h3>Single-Tab Session Demo</h3>
      <p>
        This application enforces a single active browser tab per session.
        When you open this page in a second tab, the first tab will be automatically logged out.
      </p>
      <p>
        <strong>Try it:</strong> Duplicate this tab (Ctrl+Shift+T or right-click → Duplicate).
        Watch what happens to this tab after a few seconds!
      </p>
      <p>
        Session Status: <span class="status active" id="status">ACTIVE</span>
      </p>
    </div>
    
    <h2>How It Works</h2>
    <ul>
      <li>Each session has exactly one active tab token</li>
      <li>When a new tab loads any protected page, it gets a new token</li>
      <li>The old tab's token becomes invalid</li>
      <li>Client-side polling checks token validity every 3 seconds</li>
      <li>Invalid tabs are automatically redirected to login</li>
    </ul>
    
    <h2>Explore the Banking Demo</h2>
    <p>Navigate through the menu above to explore different banking features. Each page demonstrates the single-tab session enforcement.</p>
  `;
  
  renderProtectedPage(req, res, 'Dashboard', 'Dashboard', content);
});

/**
 * GET /accounts
 * Display dummy bank accounts
 */
app.get('/accounts', (req, res) => {
  const session = getSession(req);
  
  const content = `
    <h1>My Accounts</h1>
    <p>View all your accounts and balances. Session Status: <span class="status active" id="status">ACTIVE</span></p>
    
    <div class="card">
      <h3>💰 Primary Savings Account</h3>
      <div class="info-row">
        <div class="info-label">Account Name:</div>
        <div class="info-value">Primary Savings</div>
      </div>
      <div class="info-row">
        <div class="info-label">Account Number:</div>
        <div class="info-value">**** **** **** 4821</div>
      </div>
      <div class="info-row">
        <div class="info-label">Account Type:</div>
        <div class="info-value">Savings</div>
      </div>
      <div class="info-row">
        <div class="info-label">Available Balance:</div>
        <div class="info-value" style="font-size: 20px; color: #28a745; font-weight: bold;">$12,458.32</div>
      </div>
    </div>
    
    <div class="card">
      <h3>💳 Checking Account</h3>
      <div class="info-row">
        <div class="info-label">Account Name:</div>
        <div class="info-value">Everyday Checking</div>
      </div>
      <div class="info-row">
        <div class="info-label">Account Number:</div>
        <div class="info-value">**** **** **** 7592</div>
      </div>
      <div class="info-row">
        <div class="info-label">Account Type:</div>
        <div class="info-value">Checking</div>
      </div>
      <div class="info-row">
        <div class="info-label">Available Balance:</div>
        <div class="info-value" style="font-size: 20px; color: #28a745; font-weight: bold;">$3,284.67</div>
      </div>
    </div>
    
    <div class="card">
      <h3>📈 Investment Account</h3>
      <div class="info-row">
        <div class="info-label">Account Name:</div>
        <div class="info-value">Growth Portfolio</div>
      </div>
      <div class="info-row">
        <div class="info-label">Account Number:</div>
        <div class="info-value">**** **** **** 3164</div>
      </div>
      <div class="info-row">
        <div class="info-label">Account Type:</div>
        <div class="info-value">Investment</div>
      </div>
      <div class="info-row">
        <div class="info-label">Available Balance:</div>
        <div class="info-value" style="font-size: 20px; color: #28a745; font-weight: bold;">$45,920.18</div>
      </div>
    </div>
    
    <div class="card">
      <h3>🏠 Home Loan Account</h3>
      <div class="info-row">
        <div class="info-label">Account Name:</div>
        <div class="info-value">Home Mortgage</div>
      </div>
      <div class="info-row">
        <div class="info-label">Account Number:</div>
        <div class="info-value">**** **** **** 8903</div>
      </div>
      <div class="info-row">
        <div class="info-label">Account Type:</div>
        <div class="info-value">Loan</div>
      </div>
      <div class="info-row">
        <div class="info-label">Outstanding Balance:</div>
        <div class="info-value" style="font-size: 20px; color: #dc3545; font-weight: bold;">$184,562.00</div>
      </div>
    </div>
  `;
  
  renderProtectedPage(req, res, 'Accounts', 'Accounts', content);
});

/**
 * GET /transactions
 * Display transaction history
 */
app.get('/transactions', (req, res) => {
  const session = getSession(req);
  
  const content = `
    <h1>Transaction History</h1>
    <p>View your recent transactions. Session Status: <span class="status active" id="status">ACTIVE</span></p>
    
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2026-07-17</td>
          <td>Online Purchase - Amazon.com</td>
          <td>Shopping</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$87.42</td>
          <td>$3,284.67</td>
        </tr>
        <tr>
          <td>2026-07-16</td>
          <td>Salary Deposit</td>
          <td>Income</td>
          <td style="color: #28a745;">Credit</td>
          <td>+$4,200.00</td>
          <td>$3,372.09</td>
        </tr>
        <tr>
          <td>2026-07-15</td>
          <td>Electric Bill Payment</td>
          <td>Utilities</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$125.80</td>
          <td>$-827.91</td>
        </tr>
        <tr>
          <td>2026-07-14</td>
          <td>Grocery Store - Whole Foods</td>
          <td>Groceries</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$156.23</td>
          <td>$-702.11</td>
        </tr>
        <tr>
          <td>2026-07-13</td>
          <td>ATM Withdrawal</td>
          <td>Cash</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$200.00</td>
          <td>$-545.88</td>
        </tr>
        <tr>
          <td>2026-07-12</td>
          <td>Gas Station - Shell</td>
          <td>Transportation</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$65.40</td>
          <td>$-345.88</td>
        </tr>
        <tr>
          <td>2026-07-11</td>
          <td>Restaurant - Italian Bistro</td>
          <td>Dining</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$98.50</td>
          <td>$-280.48</td>
        </tr>
        <tr>
          <td>2026-07-10</td>
          <td>Netflix Subscription</td>
          <td>Entertainment</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$15.99</td>
          <td>$-181.98</td>
        </tr>
        <tr>
          <td>2026-07-09</td>
          <td>Insurance Premium</td>
          <td>Insurance</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$340.00</td>
          <td>$-165.99</td>
        </tr>
        <tr>
          <td>2026-07-08</td>
          <td>Refund - Electronics Store</td>
          <td>Refund</td>
          <td style="color: #28a745;">Credit</td>
          <td>+$245.00</td>
          <td>$174.01</td>
        </tr>
        <tr>
          <td>2026-07-07</td>
          <td>Online Transfer to Savings</td>
          <td>Transfer</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$500.00</td>
          <td>$-70.99</td>
        </tr>
        <tr>
          <td>2026-07-06</td>
          <td>Pharmacy - CVS</td>
          <td>Healthcare</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$42.30</td>
          <td>$429.01</td>
        </tr>
        <tr>
          <td>2026-07-05</td>
          <td>Coffee Shop</td>
          <td>Dining</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$6.75</td>
          <td>$471.31</td>
        </tr>
        <tr>
          <td>2026-07-04</td>
          <td>Gym Membership</td>
          <td>Health & Fitness</td>
          <td style="color: #dc3545;">Debit</td>
          <td>-$89.99</td>
          <td>$478.06</td>
        </tr>
        <tr>
          <td>2026-07-03</td>
          <td>Freelance Payment Received</td>
          <td>Income</td>
          <td style="color: #28a745;">Credit</td>
          <td>+$850.00</td>
          <td>$568.05</td>
        </tr>
      </tbody>
    </table>
  `;
  
  renderProtectedPage(req, res, 'Transactions', 'Transactions', content);
});

/**
 * GET /cards
 * Display debit/credit cards
 */
app.get('/cards', (req, res) => {
  const session = getSession(req);
  
  const content = `
    <h1>My Cards</h1>
    <p>Manage your debit and credit cards. Session Status: <span class="status active" id="status">ACTIVE</span></p>
    
    <div class="card">
      <h3>💳 Visa Platinum Credit Card</h3>
      <div class="info-row">
        <div class="info-label">Card Type:</div>
        <div class="info-value">Credit Card <span class="badge info">VISA</span></div>
      </div>
      <div class="info-row">
        <div class="info-label">Card Number:</div>
        <div class="info-value">**** **** **** 2847</div>
      </div>
      <div class="info-row">
        <div class="info-label">Status:</div>
        <div class="info-value"><span class="badge success">ACTIVE</span></div>
      </div>
      <div class="info-row">
        <div class="info-label">Expiry Date:</div>
        <div class="info-value">12/2028</div>
      </div>
      <div class="info-row">
        <div class="info-label">Credit Limit:</div>
        <div class="info-value">$15,000.00</div>
      </div>
      <div class="info-row">
        <div class="info-label">Available Credit:</div>
        <div class="info-value" style="font-size: 18px; color: #28a745; font-weight: bold;">$12,345.67</div>
      </div>
    </div>
    
    <div class="card">
      <h3>💳 Mastercard Debit Card</h3>
      <div class="info-row">
        <div class="info-label">Card Type:</div>
        <div class="info-value">Debit Card <span class="badge warning">MASTERCARD</span></div>
      </div>
      <div class="info-row">
        <div class="info-label">Card Number:</div>
        <div class="info-value">**** **** **** 7592</div>
      </div>
      <div class="info-row">
        <div class="info-label">Status:</div>
        <div class="info-value"><span class="badge success">ACTIVE</span></div>
      </div>
      <div class="info-row">
        <div class="info-label">Expiry Date:</div>
        <div class="info-value">08/2027</div>
      </div>
      <div class="info-row">
        <div class="info-label">Linked Account:</div>
        <div class="info-value">Checking Account (**** 7592)</div>
      </div>
    </div>
    
    <div class="card">
      <h3>💳 American Express Gold</h3>
      <div class="info-row">
        <div class="info-label">Card Type:</div>
        <div class="info-value">Credit Card <span class="badge" style="background-color: #FFD700; color: #333;">AMEX</span></div>
      </div>
      <div class="info-row">
        <div class="info-label">Card Number:</div>
        <div class="info-value">**** ****** *3009</div>
      </div>
      <div class="info-row">
        <div class="info-label">Status:</div>
        <div class="info-value"><span class="badge danger">BLOCKED</span></div>
      </div>
      <div class="info-row">
        <div class="info-label">Expiry Date:</div>
        <div class="info-value">03/2026</div>
      </div>
      <div class="info-row">
        <div class="info-label">Credit Limit:</div>
        <div class="info-value">$25,000.00</div>
      </div>
      <div class="info-row">
        <div class="info-label">Available Credit:</div>
        <div class="info-value" style="font-size: 18px; color: #6c757d;">$0.00 (Blocked)</div>
      </div>
    </div>
  `;
  
  renderProtectedPage(req, res, 'Cards', 'Cards', content);
});

/**
 * GET /payments
 * Transfer funds demo page
 */
app.get('/payments', (req, res) => {
  const session = getSession(req);
  
  const success = req.query.success === 'true';
  const successMessage = success ? `
    <div class="success-message">
      ✅ <strong>Transfer Simulated Successfully!</strong><br>
      This is a demo application. No actual transfer was performed.
    </div>
  ` : '';
  
  const content = `
    <h1>Transfer Funds</h1>
    <p>Send money to your beneficiaries. Session Status: <span class="status active" id="status">ACTIVE</span></p>
    
    ${successMessage}
    
    <form method="GET" action="/payments">
      <div class="form-group">
        <label for="fromAccount">From Account:</label>
        <select id="fromAccount" name="fromAccount" required>
          <option value="">-- Select Account --</option>
          <option value="savings">Primary Savings (**** 4821) - $12,458.32</option>
          <option value="checking">Everyday Checking (**** 7592) - $3,284.67</option>
          <option value="investment">Growth Portfolio (**** 3164) - $45,920.18</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="toAccount">To Account / Beneficiary:</label>
        <select id="toAccount" name="toAccount" required>
          <option value="">-- Select Beneficiary --</option>
          <option value="john">John Smith - **** **** 1234</option>
          <option value="sarah">Sarah Johnson - **** **** 5678</option>
          <option value="utility">City Electric Company - **** **** 9012</option>
          <option value="credit">Credit Card Payment - **** 2847</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="beneficiaryName">Beneficiary Name:</label>
        <input type="text" id="beneficiaryName" name="beneficiaryName" placeholder="Enter beneficiary name" required>
      </div>
      
      <div class="form-group">
        <label for="amount">Amount ($):</label>
        <input type="number" id="amount" name="amount" placeholder="0.00" step="0.01" min="0.01" required>
      </div>
      
      <div class="form-group">
        <label for="remarks">Remarks / Reference:</label>
        <textarea id="remarks" name="remarks" rows="3" placeholder="Optional remarks"></textarea>
      </div>
      
      <input type="hidden" name="success" value="true">
      <button type="submit">Submit Transfer</button>
    </form>
    
    <p style="margin-top: 20px; color: #6c757d; font-size: 14px;">
      ⚠️ Note: This is a demonstration form. No actual transfer will be performed.
    </p>
  `;
  
  renderProtectedPage(req, res, 'Payments', 'Payments', content);
});

/**
 * GET /beneficiaries
 * Display saved beneficiaries
 */
app.get('/beneficiaries', (req, res) => {
  const session = getSession(req);
  
  const content = `
    <h1>Saved Beneficiaries</h1>
    <p>Manage your saved beneficiaries for quick transfers. Session Status: <span class="status active" id="status">ACTIVE</span></p>
    
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Bank</th>
          <th>Account Number</th>
          <th>IFSC Code</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Smith</td>
          <td>Bank of America</td>
          <td>**** **** **** 1234</td>
          <td>BOFA0001234</td>
          <td><span class="badge success">ACTIVE</span></td>
        </tr>
        <tr>
          <td>Sarah Johnson</td>
          <td>Chase Bank</td>
          <td>**** **** **** 5678</td>
          <td>CHAS0005678</td>
          <td><span class="badge success">ACTIVE</span></td>
        </tr>
        <tr>
          <td>Michael Chen</td>
          <td>Wells Fargo</td>
          <td>**** **** **** 9012</td>
          <td>WELL0009012</td>
          <td><span class="badge success">ACTIVE</span></td>
        </tr>
        <tr>
          <td>Emily Davis</td>
          <td>Citibank</td>
          <td>**** **** **** 3456</td>
          <td>CITI0003456</td>
          <td><span class="badge warning">PENDING</span></td>
        </tr>
        <tr>
          <td>City Electric Company</td>
          <td>Business Bank</td>
          <td>**** **** **** 7890</td>
          <td>BUSI0007890</td>
          <td><span class="badge success">ACTIVE</span></td>
        </tr>
        <tr>
          <td>Internet Service Provider</td>
          <td>Commercial Bank</td>
          <td>**** **** **** 2345</td>
          <td>COMM0002345</td>
          <td><span class="badge success">ACTIVE</span></td>
        </tr>
        <tr>
          <td>Robert Williams</td>
          <td>TD Bank</td>
          <td>**** **** **** 6789</td>
          <td>TDBA0006789</td>
          <td><span class="badge danger">INACTIVE</span></td>
        </tr>
        <tr>
          <td>Linda Martinez</td>
          <td>PNC Bank</td>
          <td>**** **** **** 0123</td>
          <td>PNCB0000123</td>
          <td><span class="badge success">ACTIVE</span></td>
        </tr>
      </tbody>
    </table>
    
    <button style="margin-top: 20px;">+ Add New Beneficiary</button>
  `;
  
  renderProtectedPage(req, res, 'Beneficiaries', 'Beneficiaries', content);
});

/**
 * GET /profile
 * Display customer profile information
 */
app.get('/profile', (req, res) => {
  const session = getSession(req);
  
  const content = `
    <h1>My Profile</h1>
    <p>View and manage your profile information. Session Status: <span class="status active" id="status">ACTIVE</span></p>
    
    <h2>Personal Information</h2>
    <div class="card">
      <div class="info-row">
        <div class="info-label">Full Name:</div>
        <div class="info-value">${session.username}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Customer ID:</div>
        <div class="info-value">CUST-2024-${Math.floor(Math.random() * 90000) + 10000}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Email Address:</div>
        <div class="info-value">${session.username.toLowerCase().replace(' ', '.')}@example.com</div>
      </div>
      <div class="info-row">
        <div class="info-label">Phone Number:</div>
        <div class="info-value">+1 (555) 123-4567</div>
      </div>
      <div class="info-row">
        <div class="info-label">Date of Birth:</div>
        <div class="info-value">January 15, 1985</div>
      </div>
      <div class="info-row">
        <div class="info-label">Customer Since:</div>
        <div class="info-value">March 10, 2018</div>
      </div>
    </div>
    
    <h2>Address Information</h2>
    <div class="card">
      <div class="info-row">
        <div class="info-label">Street Address:</div>
        <div class="info-value">1234 Main Street, Apt 5B</div>
      </div>
      <div class="info-row">
        <div class="info-label">City:</div>
        <div class="info-value">San Francisco</div>
      </div>
      <div class="info-row">
        <div class="info-label">State / Province:</div>
        <div class="info-value">California</div>
      </div>
      <div class="info-row">
        <div class="info-label">ZIP / Postal Code:</div>
        <div class="info-value">94102</div>
      </div>
      <div class="info-row">
        <div class="info-label">Country:</div>
        <div class="info-value">United States</div>
      </div>
    </div>
    
    <h2>Banking Preferences</h2>
    <div class="card">
      <div class="info-row">
        <div class="info-label">Preferred Branch:</div>
        <div class="info-value">Downtown San Francisco Branch</div>
      </div>
      <div class="info-row">
        <div class="info-label">Branch Address:</div>
        <div class="info-value">456 Market Street, San Francisco, CA 94105</div>
      </div>
      <div class="info-row">
        <div class="info-label">Relationship Manager:</div>
        <div class="info-value">Jennifer Adams</div>
      </div>
      <div class="info-row">
        <div class="info-label">Communication Preference:</div>
        <div class="info-value">Email & SMS</div>
      </div>
    </div>
    
    <button disabled style="margin-top: 20px; margin-right: 10px;">Edit Profile</button>
    <button disabled style="margin-top: 20px;">Change Password</button>
    
    <p style="margin-top: 15px; color: #6c757d; font-size: 14px;">
      ⚠️ Note: Edit functions are disabled in this demo application.
    </p>
  `;
  
  renderProtectedPage(req, res, 'Profile', 'Profile', content);
});

/**
 * GET /session-check
 * Heartbeat endpoint for tab validation
 * 
 * Client sends its tab token in X-Tab-Token header
 * Server compares it against the current activeTabToken
 * 
 * Returns:
 * - 200 OK { status: "ok" } if token matches (tab is still active)
 * - 401 Unauthorized { status: "expired" } if token doesn't match (tab was replaced)
 */
app.get('/session-check', (req, res) => {
  const session = getSession(req);
  
  if (!session) {
    return res.status(401).json({ status: 'expired', reason: 'no-session' });
  }
  
  // Get the tab token from the request header
  const clientTabToken = req.headers['x-tab-token'];
  
  if (!clientTabToken) {
    return res.status(401).json({ status: 'expired', reason: 'no-token' });
  }
  
  // Compare the client's token with the current active token
  if (clientTabToken !== session.activeTabToken) {
    console.log(`[SESSION-CHECK] Tab token mismatch for user "${session.username}"`);
    console.log(`                Client token: ${clientTabToken.substring(0, 8)}...`);
    console.log(`                Active token: ${session.activeTabToken.substring(0, 8)}...`);
    console.log(`                → Tab is EXPIRED (another tab is active)`);
    
    return res.status(401).json({ status: 'expired', reason: 'token-mismatch' });
  }
  
  // Token matches - this tab is still active
  return res.status(200).json({ status: 'ok' });
});

/**
 * GET /logout
 * Destroy session and clear cookie
 */
app.get('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId && sessions[sessionId]) {
    const username = sessions[sessionId].username;
    console.log(`[LOGOUT] User "${username}" logged out. Session: ${sessionId.substring(0, 8)}...`);
    
    // Delete session from memory
    delete sessions[sessionId];
  }
  
  // Clear the session cookie
  res.clearCookie('sessionId');
  
  // Redirect to login
  res.redirect('/login');
});

/**
 * Root route - redirect to dashboard or login
 */
app.get('/', (req, res) => {
  const session = getSession(req);
  if (session) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('ZeroThreat Test App — Single Tab Session Demo');
  console.log('='.repeat(60));
  console.log(`Server running on port ${PORT}`);
  console.log('');
  console.log('⚠️  WARNING: This is a DEMO application for testing only!');
  console.log('   Do not use this pattern in production without proper');
  console.log('   security implementation.');
  console.log('');
  console.log('To test the single-tab session behavior:');
  console.log('1. Open http://localhost:3000/login');
  console.log('2. Login with any username/password');
  console.log('3. Duplicate the browser tab');
  console.log('4. Watch the first tab automatically logout');
  console.log('='.repeat(60));
});
