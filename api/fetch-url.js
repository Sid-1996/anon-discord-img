import { Redis } from '@upstash/redis';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'change-me-to-your-own-token';

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

export default async function handler(req, res) {
  if (req.headers['x-access-token'] !== ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!DISCORD_WEBHOOK_URL) {
    return res.status(500).json({ error: '後端未設定 Webhook 網址' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (redis) {
    try {
      const count = await redis.incr(`rate:url:${ip}`);
      if (count === 1) {
        await redis.expire(`rate:url:${ip}`, 60);
      }
      if (count > 10) {
        return res.status(429).json({ error: '發送太過頻繁，請稍後再試' });
      }
    } catch {
      // Redis not configured — skip rate limiting
    }
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const { url, spoiler, content } = body;

    if (!url) {
      return res.status(400).json({ error: '缺少 url 參數' });
    }

    const sanitize = (str) => String(str)
      .replace(/@everyone/g, '@\u200Beveryone')
      .replace(/@here/g, '@\u200Bhere')
      .slice(0, 50);

    const isTwitter = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i.test(url);
    let discordRes;

    if (isTwitter) {
      if (spoiler) {
        // 勾暴雷：Discord 不產生 embed → 下載圖片上傳為暴雷附件
        const imageBuffer = await fetchTwitterImage(url);
        const discordForm = new FormData();
        const mime = detectMime(imageBuffer);
        const ext = mime === 'image/png' ? 'png' : 'jpg';
        const blob = new Blob([imageBuffer], { type: mime });
        discordForm.append('file', blob, `SPOILER_image.${ext}`);

        let messageContent = `||${url}||`;
        if (content) {
          messageContent += `\n${sanitize(content)}`;
        }
        discordForm.append('payload_json', JSON.stringify({ content: messageContent }));

        discordRes = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
          method: 'POST',
          body: discordForm,
        });
      } else {
        // 不勾暴雷：Discord 原生 embed，只傳網址
        let messageContent = url;
        if (content) {
          messageContent += `\n${sanitize(content)}`;
        }
        discordRes = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageContent }),
        });
      }
    } else {
      // i.pximg.net：下載圖片後上傳附件
      const imageBuffer = await fetchImage(url);
      const discordForm = new FormData();
      const mime = detectMime(imageBuffer);
      const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'png' : 'jpg';
      const filename = spoiler ? `SPOILER_image.${ext}` : `image.${ext}`;
      const blob = new Blob([imageBuffer], { type: mime });
      discordForm.append('file', blob, filename);

      let messageContent = '';
      if (content) {
        messageContent = sanitize(content);
      }
      discordForm.append('payload_json', JSON.stringify({ content: messageContent }));

      discordRes = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        body: discordForm,
      });
    }

    if (discordRes.ok) {
      const discordData = await discordRes.json();
      return res.status(200).json({ id: discordData.id });
    } else {
      const errLog = await discordRes.text();
      return res.status(500).json({ error: `Discord 拒絕接收：${errLog}` });
    }
  } catch (err) {
    if (err.message.startsWith('不支援的網址') || err.message.includes('沒有圖片')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: `後端處理錯誤: ${err.message}` });
  }
}

async function fetchTwitterImage(url) {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  if (!match) throw new Error('不支援的網址');
  const tweetId = match[1];
  const fxRes = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
  if (!fxRes.ok) throw new Error('無法取得推文資訊');
  const fxData = await fxRes.json();
  const media = fxData.tweet?.media;
  if (!media) throw new Error('此推文沒有圖片或影片');
  let imgUrl = media.photos?.[0]?.url;
  if (!imgUrl) imgUrl = media.videos?.[0]?.thumbnail_url;
  if (!imgUrl) throw new Error('此推文沒有圖片或影片');
  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) throw new Error('Twitter 圖片下載失敗');
  return Buffer.from(await imgRes.arrayBuffer());
}

async function fetchImage(url) {
  if (/i\.pximg\.net\/.+\.(?:jpg|jpeg|png|webp|gif)/i.test(url)) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const imgRes = await fetch(url, {
        headers: { 'Referer': 'https://www.pixiv.net/' },
      });
      if (imgRes.ok) {
        return Buffer.from(await imgRes.arrayBuffer());
      }
      if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
    throw new Error('Pixiv 圖片下載失敗');
  }

  throw new Error('不支援的網址');
}

function detectMime(buffer) {
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
  return 'image/jpeg';
}
