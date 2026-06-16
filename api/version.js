export default function handler(req, res) {
    res.json({ version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev' });
}
