import app from '../server/index.js';

export default function handler(req, res) {
  const originalUrl = req.url || '/';

  // Normalize the Vercel function request path so the existing Express routes
  // continue to work in both local Node and serverless environments.
  if (!originalUrl.startsWith('/api')) {
    req.url = originalUrl === '/' ? '/api' : `/api${originalUrl}`;
  }

  return app(req, res);
}
