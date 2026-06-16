import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'change-me-to-your-own-token';

export default async function handler(req, res) {
  if (req.headers['x-access-token'] !== ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const { url } = body;

    if (!url) {
      return res.status(400).json({ error: '缺少 url 參數' });
    }

    const imageBuffer = await fetchImage(url);

    if (imageBuffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ error: '圖片大小不可超過 8MB' });
    }

    const mime = detectMime(imageBuffer);
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');

    const resized = await sharp(imageBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    return res.status(200).send(resized);
  } catch (err) {
    if (err.message.startsWith('不支援的網址') || err.message.includes('沒有圖片')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: `預覽圖片下載失敗: ${err.message}` });
  }
}

async function fetchImage(url) {
  let match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  if (match) {
    const tweetId = match[1];
    const fxRes = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
    if (!fxRes.ok) {
      throw new Error('無法取得推文資訊');
    }
    const fxData = await fxRes.json();
    const media = fxData.tweet?.media;
    if (!media) {
      throw new Error('此推文沒有圖片或影片');
    }
    let imgUrl = media.photos?.[0]?.url;
    if (!imgUrl) {
      imgUrl = media.videos?.[0]?.thumbnail_url;
    }
    if (!imgUrl) {
      throw new Error('此推文沒有圖片或影片');
    }
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) {
      throw new Error('Twitter 圖片下載失敗');
    }
    return Buffer.from(await imgRes.arrayBuffer());
  }

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

  throw new Error('不支援的網址，目前僅支援 Twitter/X 貼文和 Pixiv 圖片連結（右鍵複製圖片網址）');
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
