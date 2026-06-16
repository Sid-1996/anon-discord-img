# anon-discord-img / 匿名 Discord 發圖工具

> 上傳圖片到 Discord 頻道，自動加上暴雷遮罩 — 不需登入、不需額外點擊。
> Upload images to a Discord channel with auto-spoiler — no login, no extra clicks.

![status](https://img.shields.io/badge/status-stable-green)

---

## 功能 Features

- **拖曳 / 貼上 / 選取**上傳圖片 — Drag & drop, paste, or file picker
- **局部馬賽克**筆刷（全客戶端 Canvas，不外送）— Local mosaic brush (client-side only)
- 發送 **Twitter/X 貼文連結** 或 **Pixiv 圖片網址** 到 Discord
- 自動暴雷（檔名加 `SPOILER_` 前綴，Discord 自動遮罩）
- 發送歷史 3 天內可個別撤回

---

## 前置需求 Prerequisites

準備好這兩樣就能開始：

1. **Discord 頻道的 Webhook 網址** — 看下面的教學
2. **Vercel 帳號**（免費方案即可）

---

## 一步一步教學 Step-by-Step Guide

### 第一步：取得 Discord Webhook 網址

> 你需要頻道的「管理 Webhook」權限。如果你是自己伺服器的管理員，預設就有。

**中文教學：**

1. 打開你的 Discord 伺服器
2. 選取一個頻道（你想讓圖片發送到這裡）
3. 點齒輪 ⚙️ 編輯頻道 → **整合** → **Webhook**
4. 點 **新增 Webhook**，取個名字，複製 Webhook 網址
5. 網址長這樣：`https://discord.com/api/webhooks/123456/abc-def-ghi`

**In English:**

1. Open your Discord server
2. Pick a channel (images will be sent here)
3. Click the gear icon (Edit Channel) → **Integrations** → **Webhooks**
4. Click **Create Webhook**, give it a name, and copy the URL
5. It looks like: `https://discord.com/api/webhooks/123456/abc-def-ghi`

---

### 第二步：部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**中文步驟：**

1. 點上面的 **Deploy** 按鈕
2. 匯入這個 GitHub 倉庫
3. 在「Environment Variables」頁面新增：
   - `DISCORD_WEBHOOK_URL` — 貼上第一步拿到的 Webhook 網址
   - `ACCESS_TOKEN` — 自訂一組密碼（例如 `MyR4nd0mK3y!`），保護你的服務不被陌生人亂用
4. 按 Deploy — 完成！你的網址是 `https://你的專案名.vercel.app`

**In English:**

1. Click the **Deploy** button above
2. Import this repository
3. Add these environment variables:
   - `DISCORD_WEBHOOK_URL` — your webhook URL from step 1
   - `ACCESS_TOKEN` — pick a strong random string to block unauthorized users
4. Hit Deploy — done. Your instance is live at `https://your-project.vercel.app`

---

### 第三步：本地開發（可選）

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

## 環境變數 Environment Variables

| 變數 Variable | 必要 Required | 說明 Description |
|---|---|---|
| `DISCORD_WEBHOOK_URL` | ✅ 是 Yes | Discord Webhook 完整網址 |
| `ACCESS_TOKEN` | ❌ 選填 Optional | API 存取密碼（預設：`change-me-to-your-own-token`） |
| `KV_URL` / `KV_REST_API_URL` / `KV_REST_API_TOKEN` | ❌ 選填 Optional | Vercel KV（分散式限流，多區域部署才需要） |

---

## 安全機制 Security

| 機制 Layer | 說明 Description |
|---|---|
| **ACCESS_TOKEN** | 每次 API 請求須帶 `x-access-token` 標頭，擋掉亂掃的 crawler |
| **大小限制** | 單檔最大 8MB |
| **Magic byte 驗證** | 伺服器檢查真實檔案類型（JPEG/PNG/WebP），不看副檔名 |
| **@everyone / @here 消毒** | 自動屏蔽，避免被濫用 |
| **限流** | 每 IP 每 60 秒 10 次（有 KV 則啟用分散式，無 KV 則略過） |
| **暫存檔清理** | 處理完立即刪除 |

---

## URL 支援類型 Supported URLs

| 類型 Type | 範例 Example | 行為 Behavior |
|---|---|---|
| Twitter/X 貼文 | `https://x.com/user/status/123` | 不暴雷：直接送網址（Discord 自動 embed）；有暴雷：下載圖片當附件送出 |
| Pixiv 圖片 | `https://i.pximg.net/.../img.jpg` | 經伺服器 proxy 下載（Pixiv 需要自訂 Referer），以附件送出 |

---

## 專案結構 Project Structure

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

## License / 授權

MIT — 自由使用、修改、商用。
