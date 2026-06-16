# Discord Spoiler Uploader

A minimal web app that lets you upload images to a Discord channel **with the spoiler flag automatically enabled** — no login, no extra clicks.

![screenshot](https://img.shields.io/badge/status-stable-green)

---

## What This Does

- Upload images via drag & drop, file picker, or Ctrl+V paste
- Optional local mosaic tool (brush-based, runs entirely in your browser)
- Send Twitter/X post links or Pixiv image links directly to Discord
- All images are automatically marked as spoilers (`SPOILER_` prefix)
- Upload history stored in browser for 3 days, with individual undo

---

## How to Set Up Your Own Instance

### 1. Get a Discord Webhook URL

1. Open your Discord server
2. Go to the channel you want images sent to
3. Click the gear icon (Edit Channel) → **Integrations** → **Webhooks**
4. Click **Create Webhook**, give it a name, and copy the Webhook URL
5. It looks like: `https://discord.com/api/webhooks/123456/abc-def-ghi`

> You need **Manage Webhooks** permission on the server. If you own the server, you have it.

### 2. Deploy to Vercel (Free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above
2. Import this GitHub repository
3. In the **Environment Variables** step, add:
   - `DISCORD_WEBHOOK_URL` — paste the webhook URL from step 1
   - `ACCESS_TOKEN` — create a random string (e.g. `mYr4nD0mT0k3n!`). This protects your instance from strangers.
4. Deploy — that's it. Your instance is live at `https://your-project.vercel.app`

### 3. Run Locally (For Development)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Install project dependencies
npm install

# Create a .env file (copy from example)
copy .env.example .env
# Edit .env and fill in your DISCORD_WEBHOOK_URL and ACCESS_TOKEN

# Start dev server
vercel dev
```

Open `http://localhost:3000` in your browser.

---

## Security Layers

| Layer | What It Does |
|---|---|
| **ACCESS_TOKEN** | Every API request must include `x-access-token` header; blocks random crawlers |
| **File size limit** | 8 MB max per upload |
| **Magic byte check** | Server validates actual file type (JPEG/PNG/WebP) by binary header, not just extension |
| **@everyone / @here filter** | Neutralized to prevent mass-ping abuse |
| **Rate limiting** | 10 requests / 60s per IP (uses Vercel KV if configured, falls back gracefully) |
| **Temp file cleanup** | Files deleted immediately after processing |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_WEBHOOK_URL` | ✅ Yes | Your full Discord webhook URL |
| `ACCESS_TOKEN` | ❌ Optional | Custom API access token (default: `change-me-to-your-own-token`) |
| `KV_URL` / `KV_REST_API_URL` / `KV_REST_API_TOKEN` | ❌ Optional | Vercel KV for distributed rate limiting |

---

## Project Structure

```
├── api/
│   ├── send.js           Image upload to Discord (multipart POST, DELETE)
│   ├── fetch-url.js      Forward Twitter/Pixiv URLs to Discord
│   ├── preview.js        Proxy Pixiv images with sharp thumbnail + cache
│   └── version.js        Returns git commit SHA for version stamp
├── index.html            Single-page frontend (HTML + CSS + JS + Canvas mosaic)
├── vercel.json           Vercel routing config
├── package.json          Dependencies (formidable, @vercel/kv, sharp)
├── .env.example          Environment variable template
├── .gitignore
└── LICENSE
```

---

## Supported URL Types

| Type | Example | Behavior |
|---|---|---|
| Twitter/X post | `https://x.com/user/status/123` | Sends link directly (Discord generates embed). If spoiler is on, downloads the image and sends as spoiler attachment. |
| Pixiv image | `https://i.pximg.net/.../img.jpg` | Downloads via server proxy (Pixiv requires `Referer` header), sends as attachment. |

---

## License

MIT
