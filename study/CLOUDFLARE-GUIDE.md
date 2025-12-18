# Cloudflare Complete Guide

This document explains Cloudflare Workers, Cron Jobs, Pages, KV storage, and everything you need to know about Cloudflare's serverless platform.

---

## 📦 Cloudflare Products Overview

| Product | Purpose | Free Tier |
|---------|---------|-----------|
| **Workers** | Serverless JavaScript/TypeScript functions | 100,000 requests/day |
| **Pages** | Static site hosting (like Vercel/Netlify) | Unlimited sites |
| **KV** | Key-Value storage database | 100,000 reads/day |
| **D1** | SQLite database at edge | 5GB storage |
| **R2** | Object storage (like S3) | 10GB storage |
| **Durable Objects** | Stateful serverless computing | Limited free |
| **Queues** | Message queues | Limited free |

---

## 🔧 Cloudflare Workers

Workers are serverless functions that run on Cloudflare's edge network (300+ locations worldwide).

### Use Cases
- API backends
- Cron jobs (scheduled tasks)
- URL redirects
- Request/response manipulation
- Authentication middleware
- Webhooks

### Project Structure

```
my-worker/
├── wrangler.toml      # Configuration file
├── index.js           # Main worker code (or src/index.ts)
├── package.json       # Dependencies (optional)
└── node_modules/      # If using npm packages
```

---

## 📄 wrangler.toml Configuration

The `wrangler.toml` file configures your worker.

### Basic Example

```toml
name = "my-worker"           # Worker name (used in URL)
main = "index.js"            # Entry point file
compatibility_date = "2025-12-17"  # API compatibility date
```

### Full Configuration Options

```toml
# Basic Settings
name = "my-worker"                    # Worker name
main = "src/index.ts"                 # Entry point
compatibility_date = "2025-12-17"     # API version date

# Account Settings (optional - usually auto-detected)
account_id = "your-account-id"        # Your Cloudflare account ID

# Environment Variables
[vars]
API_KEY = "your-api-key"
ENVIRONMENT = "production"

# Secrets (set via CLI, not in file)
# Use: wrangler secret put SECRET_NAME

# Cron Triggers
[triggers]
crons = ["*/5 * * * *"]              # Run every 5 minutes

# KV Namespaces
[[kv_namespaces]]
binding = "MY_KV"                     # Variable name in code
id = "abc123..."                      # KV namespace ID

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xyz789..."

# R2 Bucket
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "my-bucket"

# Routes (custom domain)
routes = [
    { pattern = "api.example.com/*", zone_name = "example.com" }
]

# Development settings
[dev]
port = 8787                           # Local dev server port
```

---

## ⏰ Cron Jobs (Scheduled Workers)

Cron jobs run your worker on a schedule automatically.

### Configuration

```toml
[triggers]
crons = ["*/5 * * * *"]    # Every 5 minutes
```

### Cron Expression Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
│ │ │ │ │
* * * * *
```

### Common Cron Patterns

| Pattern | Description |
|---------|-------------|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `*/15 * * * *` | Every 15 minutes |
| `0 * * * *` | Every hour (at minute 0) |
| `0 */2 * * *` | Every 2 hours |
| `0 0 * * *` | Every day at midnight UTC |
| `0 9 * * 1` | Every Monday at 9 AM UTC |
| `0 0 1 * *` | First day of every month |

### Cron Worker Code Example

```javascript
export default {
    // Runs on cron schedule
    async scheduled(event, env, ctx) {
        console.log("Cron triggered at:", event.scheduledTime);
        
        try {
            // Ping a server to keep it awake
            const response = await fetch("https://your-api.com/health");
            console.log("Ping status:", response.status);
        } catch (error) {
            console.error("Ping failed:", error);
        }
    },
    
    // Optional: Also handle HTTP requests
    async fetch(request, env, ctx) {
        return new Response("Worker is running!");
    }
};
```

---

## 🌐 HTTP Request Handlers

### Basic HTTP Worker

```javascript
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // Route handling
        if (url.pathname === "/api/hello") {
            return new Response(JSON.stringify({ message: "Hello!" }), {
                headers: { "Content-Type": "application/json" }
            });
        }
        
        if (url.pathname === "/api/data" && request.method === "POST") {
            const body = await request.json();
            return new Response(JSON.stringify({ received: body }), {
                headers: { "Content-Type": "application/json" }
            });
        }
        
        return new Response("Not Found", { status: 404 });
    }
};
```

### Request Object Properties

```javascript
async fetch(request, env, ctx) {
    request.method      // GET, POST, PUT, DELETE, etc.
    request.url         // Full URL string
    request.headers     // Headers object
    request.body        // Request body (stream)
    
    // Parse URL
    const url = new URL(request.url);
    url.pathname        // /api/users
    url.searchParams    // URLSearchParams object
    url.hostname        // example.com
    
    // Read body
    const json = await request.json();   // Parse JSON
    const text = await request.text();   // Raw text
    const form = await request.formData(); // Form data
}
```

### Response Examples

```javascript
// JSON response
return new Response(JSON.stringify({ data: "value" }), {
    status: 200,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    }
});

// Redirect
return Response.redirect("https://example.com", 302);

// Error
return new Response("Server Error", { status: 500 });

// HTML
return new Response("<h1>Hello</h1>", {
    headers: { "Content-Type": "text/html" }
});
```

---

## 🗄️ Environment Variables & Secrets

### Environment Variables (Non-sensitive)

In `wrangler.toml`:
```toml
[vars]
API_URL = "https://api.example.com"
DEBUG = "true"
```

Access in code:
```javascript
export default {
    async fetch(request, env) {
        console.log(env.API_URL);    // https://api.example.com
        console.log(env.DEBUG);      // true
    }
};
```

### Secrets (Sensitive - API keys, passwords)

Set via CLI (never put in files!):
```bash
wrangler secret put DATABASE_URL
# Enter your secret when prompted
```

Access same way:
```javascript
export default {
    async fetch(request, env) {
        const dbUrl = env.DATABASE_URL;
    }
};
```

---

## 💾 KV (Key-Value) Storage

Fast, eventually-consistent key-value storage.

### Create KV Namespace

```bash
wrangler kv:namespace create "MY_STORE"
```

### Configure in wrangler.toml

```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "abc123def456..."
```

### Usage in Code

```javascript
export default {
    async fetch(request, env) {
        // Write
        await env.MY_KV.put("user:123", JSON.stringify({ name: "John" }));
        
        // Read
        const value = await env.MY_KV.get("user:123");
        const parsed = JSON.parse(value);
        
        // Delete
        await env.MY_KV.delete("user:123");
        
        // List keys
        const keys = await env.MY_KV.list({ prefix: "user:" });
        
        // Write with expiration (TTL in seconds)
        await env.MY_KV.put("session:abc", "data", { expirationTtl: 3600 });
        
        return new Response(JSON.stringify(parsed));
    }
};
```

---

## 📦 Cloudflare Pages

Static site hosting with Git integration.

### Deployment Methods

1. **Git Integration** - Connect GitHub/GitLab, auto-deploy on push
2. **Direct Upload** - Upload build folder via CLI
3. **Wrangler CLI** - `wrangler pages deploy ./dist`

### Framework Presets

| Framework | Build Command | Output Dir |
|-----------|---------------|------------|
| React (Vite) | `npm run build` | `dist` |
| Next.js | `npm run build` | `.next` |
| Vue | `npm run build` | `dist` |
| Astro | `npm run build` | `dist` |
| Plain HTML | (none) | `/` |

### Pages Functions (API Routes)

Create `functions/` folder for serverless API:

```
my-site/
├── public/              # Static files
├── dist/                # Build output
└── functions/           # API routes
    ├── api/
    │   └── hello.js     # /api/hello
    └── users/
        └── [id].js      # /users/:id (dynamic)
```

**functions/api/hello.js:**
```javascript
export async function onRequest(context) {
    return new Response(JSON.stringify({ message: "Hello" }), {
        headers: { "Content-Type": "application/json" }
    });
}
```

---

## 🛠️ Wrangler CLI Commands

### Installation

```bash
npm install -g wrangler
# or
npm install wrangler --save-dev
```

### Authentication

```bash
wrangler login          # Browser login
wrangler logout         # Logout
wrangler whoami         # Check logged in user
```

### Development

```bash
wrangler dev            # Start local dev server
wrangler dev --remote   # Dev with remote resources (KV, D1)
```

### Deployment

```bash
wrangler deploy         # Deploy worker
wrangler publish        # Same as deploy (deprecated name)
```

### Secrets & KV

```bash
wrangler secret put SECRET_NAME    # Add secret
wrangler secret delete SECRET_NAME # Delete secret
wrangler secret list               # List secrets

wrangler kv:namespace create "NAME"  # Create KV
wrangler kv:key put --binding=MY_KV "key" "value"  # Add key
wrangler kv:key get --binding=MY_KV "key"          # Get key
```

### Logs

```bash
wrangler tail           # Live logs from deployed worker
```

---

## 🚀 Deployment Workflow

### 1. Initialize Project

```bash
npm create cloudflare@latest my-worker
cd my-worker
```

### 2. Develop Locally

```bash
wrangler dev
# Opens http://localhost:8787
```

### 3. Deploy

```bash
wrangler deploy
# Deploys to: https://my-worker.<your-subdomain>.workers.dev
```

### 4. Monitor

```bash
wrangler tail    # View live logs
```

---

## 📋 Your Project's Cloudflare Setup

Based on your `backend/cloudfare/` folder:

### wrangler.toml
```toml
name = "backend-ping"           # Worker name
main = "index.js"               # Entry point
compatibility_date = "2025-12-17"

[triggers]
crons = ["*/5 * * * *"]         # Runs every 5 minutes
```

### index.js (Cron Worker)
```javascript
export default {
    async scheduled(event, env, ctx) {
        try {
            // Pings Render backend to keep it awake
            const response = await fetch("https://study-g3xc.onrender.com/health", {
                method: "GET",
                headers: { "User-Agent": "CF-Worker-Cron" }
            });
            console.log("GET status:", response.status);
        } catch (error) {
            console.error("GET failed:", error);
        }
    }
};
```

**Purpose:** This cron job pings your Render.com backend every 5 minutes to prevent it from sleeping (Render free tier sleeps after 15 minutes of inactivity).

---

## 💡 Common Patterns

### Keep Backend Awake (Your Use Case)

```javascript
export default {
    async scheduled(event, env, ctx) {
        const endpoints = [
            "https://your-api.onrender.com/health",
            "https://backup-api.fly.dev/ping"
        ];
        
        for (const url of endpoints) {
            try {
                const res = await fetch(url);
                console.log(`${url}: ${res.status}`);
            } catch (e) {
                console.error(`${url} failed:`, e.message);
            }
        }
    }
};
```

### API Proxy with CORS

```javascript
export default {
    async fetch(request, env) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };
        
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }
        
        const response = await fetch("https://api.example.com/data");
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};
```

### URL Shortener with KV

```javascript
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const code = url.pathname.slice(1); // Remove leading /
        
        const targetUrl = await env.LINKS.get(code);
        
        if (targetUrl) {
            return Response.redirect(targetUrl, 302);
        }
        
        return new Response("Not Found", { status: 404 });
    }
};
```

---

## 📊 Limits & Pricing (Free Tier)

| Resource | Free Limit |
|----------|------------|
| Worker Requests | 100,000/day |
| Worker CPU Time | 10ms/request |
| Cron Invocations | Unlimited |
| KV Reads | 100,000/day |
| KV Writes | 1,000/day |
| KV Storage | 1GB |
| Pages Sites | Unlimited |
| Pages Bandwidth | Unlimited |

---

## 🔗 Useful Links

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [KV Documentation](https://developers.cloudflare.com/kv/)
- [Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Examples Gallery](https://developers.cloudflare.com/workers/examples/)

---

*Last updated: December 2024*
