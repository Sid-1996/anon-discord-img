# anon-discord-img / 匿名 Discord 發圖工具

> 匿名上傳圖片到 Discord，自動暴雷遮罩 • 不需登入、不需額外點擊
> Upload images to Discord with auto-spoiler — no login, no extra clicks.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Platform](https://img.shields.io/badge/platform-Vercel-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

<details open>
<summary><b>🌏 中文</b></summary>

- [🆕 完全不懂技術？讓 AI 幫你搞定](#-完全不懂技術讓-ai-幫你搞定)
- [功能](#功能)
- [前置需求](#前置需求)
- [一步一步教學](#一步一步教學)
- [使用方式](#使用方式)
- [環境變數](#環境變數)
- [安全機制](#安全機制)
- [URL 支援類型](#url-支援類型)
- [專案結構](#專案結構)
- [授權](#license--授權)

---

### 🆕 完全不懂技術？讓 AI 幫你搞定

<details>
<summary><b>💬 方法一：讓 AI 帶你一步一步做</b></summary>

> 💡 **推薦工具：[Google App for Desktop](https://search.google/google-app/desktop/)**（Windows 免費下載）
> 這款 App 內建**螢幕分享 + Google Lens**，按下 `Alt + Space` 就能叫出來，直接讓 AI 看你的整個螢幕或特定視窗，即時告訴你下一步要點哪裡——不需要截圖、不需要切換視窗，AI 看著你的畫面教你操作。
>
> ⚠️ 目前僅支援 Windows 10+，介面為英文，但**對話支援流利中文**，直接用中文問它沒問題。非 Windows 用戶可改用 [Google Gemini](https://gemini.google.com/app)（截圖貼入對話即可）。

把下面這段文字複製，貼進 Google App 或任何 AI 對話框，讓它帶你完成整個部署流程。遇到看不懂的畫面，直接開螢幕分享或截圖丟給它問：

```
我想部署一個開源工具，GitHub 網址是 https://github.com/Sid-1996/anon-discord-img
我完全沒有技術背景。請用繁體中文，一步一步帶我完成：
1. 建立免費 GitHub 帳號（如果還沒有）
2. 建立免費 Vercel 帳號
3. 在 Discord 取得 Webhook 網址
4. 用 Vercel 的一鍵部署按鈕部署這個專案，填入環境變數
5. 確認部署成功並找到我的網址
每次只教一步，等我說「好了」或「完成」再繼續下一步。
```

</details>

<details>
<summary><b>🤖 方法二：讓 Codex / Cursor 直接幫你架</b></summary>

如果你有 [OpenAI Codex](https://codex.openai.com) 或 [Cursor](https://cursor.sh) 等 AI coding 工具，可以把下面這段指令貼進去，讓 AI 直接執行部署：

```
Please help me deploy the project at https://github.com/Sid-1996/anon-discord-img to Vercel.

Steps to complete:
1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example` — ask me for the values of DISCORD_WEBHOOK_URL and ACCESS_TOKEN before proceeding
4. Run `vercel --prod` to deploy (install Vercel CLI if not present)
5. Confirm the deployment URL and verify the app is live

Ask me for any credentials you need. Do not proceed past step 3 until I provide the values.
```

> ⚠️ 注意：執行前請確認你已安裝 [Node.js](https://nodejs.org)（v18 以上）與 [Vercel CLI](https://vercel.com/docs/cli)，或讓 AI 幫你安裝。

</details>

---

### 功能

- **拖曳 / 貼上 / 選取**上傳圖片
- **局部馬賽克**筆刷（全客戶端 Canvas，不外送）
- 發送 **Twitter/X 貼文連結** 或 **Pixiv 圖片網址** 到 Discord
- 自動暴雷（檔名加 `SPOILER_` 前綴，Discord 自動遮罩）
- 發送歷史 3 天內可個別撤回

---

### 前置需求

準備好這兩樣就能開始：

1. **Discord 頻道的 Webhook 網址** — 看下面的教學
2. **Vercel 帳號**（免費方案即可）

---

### 一步一步教學

#### 第一步：取得 Discord Webhook 網址

> 你需要頻道的「管理 Webhook」權限。如果你是自己伺服器的管理員，預設就有。

1. 打開你的 Discord 伺服器
2. 選取一個頻道（你想讓圖片發送到這裡）
3. 點齒輪 ⚙️ 編輯頻道 → **整合** → **Webhook**
4. 點 **新增 Webhook**，取個名字，複製 Webhook 網址
5. 網址長這樣：`https://discord.com/api/webhooks/123456/abc-def-ghi`

#### 第二步：部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sid-1996/anon-discord-img&env=DISCORD_WEBHOOK_URL,ACCESS_TOKEN&envDescription=DISCORD_WEBHOOK_URL%3A%20your%20webhook%20URL%3B%20ACCESS_TOKEN%3A%20a%20random%20password%20to%20protect%20your%20instance&project-name=anon-discord-img&repository-name=anon-discord-img)

1. 點上面的 **Deploy** 按鈕 — Vercel 會自動把這個倉庫 fork 到你的 GitHub 帳號
2. 登入（或註冊）Vercel 帳號，授權連接 GitHub
3. 在「Configure Project」頁面填入兩個環境變數：
   - `DISCORD_WEBHOOK_URL` — 貼上第一步拿到的 Webhook 網址
   - `ACCESS_TOKEN` — 自訂一組密碼（例如 `MyR4nd0mK3y!`），之後在網頁的 Token 欄位輸入這個值才能使用
4. 按 **Deploy** — 部署完成！你的網址是 `https://你的專案名.vercel.app`

#### 第三步：本地開發（可選）

```bash
# 安裝 Vercel CLI
npm install -g vercel

# 安裝相依套件
npm install

# 複製環境變數範本
copy .env.example .env
# 用記事本打開 .env，填入 DISCORD_WEBHOOK_URL 和 ACCESS_TOKEN

# 啟動開發伺服器
vercel dev
```

開啟瀏覽器前往 `http://localhost:3000`。

---

### 使用方式

部署完成後，打開你的 Vercel 網址，即可看到上傳介面。

#### 首次設定

在頁面右上角（或設定區塊）找到 **Token** 欄位，輸入你在部署時設定的 `ACCESS_TOKEN` 值，按確認儲存。之後同一瀏覽器不需要重複輸入。

#### 上傳圖片

| 方式 | 操作 |
|---|---|
| 拖曳 | 直接把圖片拖進頁面 |
| 貼上 | 複製圖片後按 `Ctrl+V` |
| 選取 | 點選頁面上的上傳區塊 |

圖片上傳後會自動加上暴雷遮罩（`SPOILER_` 前綴），在 Discord 頻道需點擊才能顯示。

#### 馬賽克筆刷

上傳圖片後可選擇啟用馬賽克筆刷，在圖片上塗抹需要遮蓋的區域。所有處理在瀏覽器內完成，圖片內容不會外送。

#### 發送 URL

在 URL 欄位貼上 Twitter/X 貼文連結或 Pixiv 圖片網址，直接發送到 Discord，無需下載再上傳。

#### 撤回訊息

發送後 3 天內，在「發送歷史」清單中找到對應訊息，點選 **撤回** 即可從 Discord 頻道刪除該則訊息。

---

### 環境變數

| 變數 | 必要 | 說明 |
|---|---|---|
| `DISCORD_WEBHOOK_URL` | ✅ | Discord Webhook 完整網址 |
| `ACCESS_TOKEN` | ❌ 選填 | API 存取密碼（預設：`change-me-to-your-own-token`） |
| `KV_URL` / `KV_REST_API_URL` / `KV_REST_API_TOKEN` | ❌ 選填 | Vercel KV（分散式限流，多區域部署才需要） |

---

### 安全機制

| 機制 | 說明 |
|---|---|
| **ACCESS_TOKEN** | 每次 API 請求須帶 `x-access-token` 標頭，擋掉亂掃的 crawler |
| **大小限制** | 單檔最大 8MB |
| **Magic byte 驗證** | 伺服器檢查真實檔案類型（JPEG/PNG/WebP），不看副檔名 |
| **@everyone / @here 消毒** | 自動屏蔽，避免被濫用 |
| **限流** | 每 IP 每 60 秒 10 次（有 KV 則啟用分散式，無 KV 則略過） |
| **暫存檔清理** | 處理完立即刪除 |

---

### URL 支援類型

| 類型 | 範例 | 行為 |
|---|---|---|
| Twitter/X 貼文 | `https://x.com/user/status/123` | 不暴雷：直接送網址（Discord 自動 embed）；有暴雷：下載圖片當附件送出 |
| Pixiv 圖片 | `https://i.pximg.net/.../img.jpg` | 經伺服器 proxy 下載（Pixiv 需要自訂 Referer），以附件送出 |

---

### 專案結構

```
├── api/
│   ├── send.js           上傳圖片到 Discord（multipart POST / DELETE）
│   ├── fetch-url.js      將 Twitter/Pixiv 網址轉發到 Discord
│   ├── preview.js        代理 Pixiv 圖片 + sharp 縮圖 + 快取
│   └── version.js        回傳 git commit SHA（版本戳記）
├── index.html            全功能前端（HTML + CSS + JS + Canvas 馬賽克）
├── vercel.json           Vercel 路由設定
├── package.json          相依套件（formidable, @vercel/kv, sharp）
├── .env.example          環境變數範本
├── .gitignore
└── LICENSE               MIT 授權
```

---

### License / 授權

MIT — 自由使用、修改、商用。

</details>

<details>
<summary><b>🌏 English</b></summary>

- [🆕 No Tech Skills? Let AI Do It](#-no-tech-skills-let-ai-do-it)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Step-by-Step Guide](#step-by-step-guide)
- [How to Use](#how-to-use)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Supported URLs](#supported-urls)
- [Project Structure](#project-structure)
- [License](#license)

---

### 🆕 No Tech Skills? Let AI Do It

<details>
<summary><b>💬 Method 1: Guided Setup via AI Chat</b></summary>

> 💡 **Recommended: [Google App for Desktop](https://search.google/google-app/desktop/)** (free, Windows only)
> Press `Alt + Space` to launch it anytime. It has **screen sharing + Lens** built in — just let the AI look at your screen or any specific window and it will tell you exactly what to click next. No screenshots needed, no tab switching.
>
> ⚠️ Windows 10+ only. The interface is in English, but **you can chat with it in Chinese** — it understands and replies fluently. Non-Windows users can use [Google Gemini](https://gemini.google.com/app) instead — just paste screenshots into the chat.

Copy the prompt below into Google App or any AI chat. If you get stuck, use screen share or paste a screenshot and ask:

```
I want to deploy an open-source tool from https://github.com/Sid-1996/anon-discord-img
I have no technical background. Please guide me step by step in plain English:
1. Create a free GitHub account (if I don't have one)
2. Create a free Vercel account
3. Get a Discord Webhook URL from my server
4. Deploy this project using the one-click Vercel button and fill in environment variables
5. Confirm the deployment and find my live URL
Teach one step at a time. Wait for me to say "done" before continuing.
```

</details>

<details>
<summary><b>🤖 Method 2: Hands-free Setup via Codex</b></summary>

If you have access to [OpenAI Codex](https://codex.openai.com) or [Cursor](https://cursor.sh), paste the prompt below and let the AI handle the entire setup:

```
Please help me deploy the project at https://github.com/Sid-1996/anon-discord-img to Vercel.

Steps to complete:
1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example` — ask me for the values of DISCORD_WEBHOOK_URL and ACCESS_TOKEN before proceeding
4. Run `vercel --prod` to deploy (install Vercel CLI if not present)
5. Confirm the deployment URL and verify the app is live

Ask me for any credentials you need. Do not proceed past step 3 until I provide the values.
```

> ⚠️ Make sure [Node.js](https://nodejs.org) (v18+) is installed, or ask the AI to install it for you first.

</details>

---

### Features

- **Drag & drop / paste / file picker** upload
- **Local mosaic brush** for censoring (client-side canvas, no data sent)
- Send **Twitter/X post** or **Pixiv image URL** to Discord
- Auto-spoiler (`SPOILER_` filename prefix)
- Recall sent messages within 3 days

---

### Prerequisites

1. **Discord channel Webhook URL** — see guide below
2. **Vercel account** (free tier works)

---

### Step-by-Step Guide

#### Step 1: Get Discord Webhook URL

> You need the "Manage Webhooks" permission on the channel. Server admins have it by default.

1. Open your Discord server
2. Pick a channel (images will be sent here)
3. Click the gear icon (Edit Channel) → **Integrations** → **Webhooks**
4. Click **Create Webhook**, give it a name, and copy the URL
5. It looks like: `https://discord.com/api/webhooks/123456/abc-def-ghi`

#### Step 2: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sid-1996/anon-discord-img&env=DISCORD_WEBHOOK_URL,ACCESS_TOKEN&envDescription=DISCORD_WEBHOOK_URL%3A%20your%20webhook%20URL%3B%20ACCESS_TOKEN%3A%20a%20random%20password%20to%20protect%20your%20instance&project-name=anon-discord-img&repository-name=anon-discord-img)

1. Click the **Deploy** button above — Vercel will automatically fork this repo to your GitHub account
2. Log in (or sign up) to Vercel and authorize GitHub access
3. Fill in two environment variables on the "Configure Project" page:
   - `DISCORD_WEBHOOK_URL` — your webhook URL from step 1
   - `ACCESS_TOKEN` — a random password (e.g. `MyR4nd0mK3y!`); you'll enter this in the Token field on the web page
4. Hit **Deploy** — done. Your instance is live at `https://your-project.vercel.app`

#### Step 3: Local Development (Optional)

```bash
# Install Vercel CLI
npm install -g vercel

# Install dependencies
npm install

# Copy environment variables template
copy .env.example .env

# Start dev server
vercel dev
```

Open `http://localhost:3000` in your browser.

---

### How to Use

Open your Vercel URL to access the upload interface.

#### First-time Setup

Find the **Token** field (top-right or settings area), enter the `ACCESS_TOKEN` you set during deployment, and confirm. The browser will remember it for future visits.

#### Upload an Image

| Method | Action |
|---|---|
| Drag & drop | Drag image onto the page |
| Paste | Copy image then `Ctrl+V` |
| File picker | Click the upload area |

Images are automatically spoiler-tagged (`SPOILER_` prefix) — Discord members must click to reveal them.

#### Mosaic Brush

After uploading, enable the mosaic brush to paint over areas you want to hide. All processing is done locally — no image data is sent externally.

#### Send a URL

Paste a Twitter/X post URL or Pixiv image URL into the URL field and send directly to Discord — no manual download needed.

#### Recall a Message

Within 3 days of sending, find the message in the send history list and click **Recall** to delete it from the Discord channel.

---

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_WEBHOOK_URL` | ✅ Yes | Full Discord Webhook URL |
| `ACCESS_TOKEN` | ❌ Optional | API access password (default: `change-me-to-your-own-token`) |
| `KV_URL` / `KV_REST_API_URL` / `KV_REST_API_TOKEN` | ❌ Optional | Vercel KV (distributed rate limiting, only needed for multi-region) |

---

### Security

| Layer | Description |
|---|---|
| **ACCESS_TOKEN** | Every API request must include `x-access-token` header — blocks random crawlers |
| **Size limit** | Max 8MB per file |
| **Magic byte validation** | Server verifies real file type (JPEG/PNG/WebP), ignores extension |
| **@everyone / @here sanitization** | Automatically stripped to prevent abuse |
| **Rate limit** | 10 requests per 60 seconds per IP (distributed with KV, skipped without) |
| **Temp file cleanup** | Deleted immediately after processing |

---

### Supported URLs

| Type | Example | Behavior |
|---|---|---|
| Twitter/X post | `https://x.com/user/status/123` | Without spoiler: send link directly (Discord auto-embed); With spoiler: download image and attach |
| Pixiv image | `https://i.pximg.net/.../img.jpg` | Proxied through server (Pixiv needs custom Referer), sent as attachment |

---

### Project Structure

```
├── api/
│   ├── send.js           Upload images to Discord (multipart POST / DELETE)
│   ├── fetch-url.js      Forward Twitter/Pixiv URLs to Discord
│   ├── preview.js        Proxy Pixiv images + sharp thumbnail + cache
│   └── version.js        Return git commit SHA (version stamp)
├── index.html            Full-featured frontend (HTML + CSS + JS + Canvas mosaic)
├── vercel.json           Vercel routing config
├── package.json          Dependencies (formidable, @vercel/kv, sharp)
├── .env.example          Environment variable template
├── .gitignore
└── LICENSE               MIT license
```

---

### License

MIT — free to use, modify, and distribute.

</details>
