import { formidable } from 'formidable';
import fs from 'fs';
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

  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (redis) {
      try {
        const count = await redis.incr(`rate:${ip}`);
        if (count === 1) {
          await redis.expire(`rate:${ip}`, 60);
        }
        if (count > 10) {
          return res.status(429).json({ error: '發送太過頻繁，請稍後再試' });
        }
      } catch {
        // Redis not configured — skip rate limiting
      }
    }

    const form = formidable({ maxFileSize: 8 * 1024 * 1024 });
    let uploadedFile = null;

    try {
      const [fields, files] = await form.parse(req);
      const file = files.file?.[0] || files.file;
      uploadedFile = file;

      if (!file) {
        return res.status(400).json({ error: '找不到上傳的圖片檔案' });
      }

      let content = (req.query.text || fields.content?.[0] || fields.content || '')
        .replace(/@everyone/g, '@\u200Beveryone')
        .replace(/@here/g, '@\u200Bhere')
        .slice(0, 50);

      const fileBuffer = fs.readFileSync(file.filepath);

      if (fileBuffer.length < 12) {
        return res.status(400).json({ error: '不支援的檔案類型，請上傳真正的 JPEG/PNG/WebP 圖片' });
      }

      const isPng = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47;
      const isJpeg = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF && (fileBuffer[3] === 0xE0 || fileBuffer[3] === 0xE1);
      const isWebp = fileBuffer[0] === 0x52 && fileBuffer[1] === 0x49 && fileBuffer[2] === 0x46 && fileBuffer[3] === 0x46 &&
                     fileBuffer[8] === 0x57 && fileBuffer[9] === 0x45 && fileBuffer[10] === 0x42 && fileBuffer[11] === 0x50;

      if (!isPng && !isJpeg && !isWebp) {
        return res.status(400).json({ error: '不支援的檔案類型，請上傳真正的 JPEG/PNG/WebP 圖片' });
      }

      const discordForm = new FormData();
      const blob = new Blob([fileBuffer], { type: file.mimetype });
      discordForm.append('file', blob, 'SPOILER_image.png');
      if (content) {
        discordForm.append('payload_json', JSON.stringify({ content }));
      }

      const discordRes = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        body: discordForm,
      });

      if (discordRes.ok) {
        const discordData = await discordRes.json();
        return res.status(200).json({ id: discordData.id });
      } else {
        const errLog = await discordRes.text();
        return res.status(500).json({ error: `Discord 拒絕接收：${errLog}` });
      }

    } catch (error) {
      if (error.code === 1009) {
        return res.status(400).json({ error: '檔案大小不可超過 8MB' });
      }
      return res.status(500).json({ error: `後端處理錯誤: ${error.message}` });
    } finally {
      if (uploadedFile) {
        fs.unlink(uploadedFile.filepath, () => {});
      }
    }
  }

  if (req.method === 'DELETE') {
    const { messageId } = req.query;
    if (!messageId) {
      return res.status(400).json({ error: '缺少 messageId 參數' });
    }
    try {
      const deleteRes = await fetch(`${DISCORD_WEBHOOK_URL}/messages/${messageId}`, {
        method: 'DELETE',
      });
      if (deleteRes.ok) {
        return res.status(200).json({ success: true });
      } else {
        const errLog = await deleteRes.text();
        return res.status(500).json({ error: `Discord 拒絕刪除：${errLog}` });
      }
    } catch (error) {
      return res.status(500).json({ error: `後端刪除錯誤: ${error.message}` });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
