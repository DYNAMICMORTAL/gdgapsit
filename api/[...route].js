import app from '../server/index.js';

export default function handler(req, res) {
  const originalUrl = req.url || '/';
  const [pathname = '/', search = ''] = originalUrl.split('?');
  const routeParam = req.query?.route;
  const routeSegments = Array.isArray(routeParam)
    ? routeParam
    : typeof routeParam === 'string'
      ? [routeParam]
      : [];

  // Vercel's catch-all function can expose nested segments through req.query.route
  // while req.url only contains the last segment. Rebuild the full API path so
  // Express sees /api/admin/login instead of /api/login.
  if (routeSegments.length > 0) {
    req.url = `/api/${routeSegments.join('/')}${search ? `?${search}` : ''}`;
  } else if (!pathname.startsWith('/api')) {
    req.url = pathname === '/' ? '/api' : `/api${pathname}${search ? `?${search}` : ''}`;
  }

  return app(req, res);
}
