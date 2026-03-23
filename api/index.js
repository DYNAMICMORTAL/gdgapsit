import app from '../server/index.js';

export default function handler(req, res) {
  const originalUrl = req.url || '/';
  const [pathname = '/', search = ''] = originalUrl.split('?');
  const pathParam = req.query?.path;
  const pathSegments = Array.isArray(pathParam)
    ? pathParam
    : typeof pathParam === 'string' && pathParam.length > 0
      ? [pathParam]
      : [];

  // Route every /api/* request through one function so nested paths remain
  // stable on Vercel, then rebuild the Express path from the rewrite param.
  if (pathSegments.length > 0) {
    req.url = `/api/${pathSegments.join('/')}${search ? `?${search}` : ''}`;
  } else if (!pathname.startsWith('/api')) {
    req.url = pathname === '/' ? '/api' : `/api${pathname}${search ? `?${search}` : ''}`;
  }

  return app(req, res);
}
