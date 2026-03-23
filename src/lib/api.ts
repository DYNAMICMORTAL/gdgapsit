// ─── Central API Client ───────────────────────────────────────────────────
// All requests go through Vite's proxy -> http://localhost:3001

const BASE = '/api';

function getToken() {
  return localStorage.getItem('gdg_admin_token');
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    if (token && res.status === 401 && path.startsWith('/admin') && path !== '/admin/login') {
      localStorage.removeItem('gdg_admin_token');
      window.location.reload();
      // Throw immediately to halt the execution
      throw new Error('Session expired');
    }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API error');
  }
  return res.json();
}

// ── Public ──────────────────────────────────────────────────────────────────
export const api = {
  getEvents: ()                  => apiFetch('/events'),
  getEvent:  (slug: string)      => apiFetch(`/events/${slug}`),
  getTeam:   ()                  => apiFetch('/team'),
  getGallery:()                  => apiFetch('/gallery'),
  getQuiz:   (slug: string)      => apiFetch(`/quiz/${slug}`),
  getSettings:()                 => apiFetch('/settings'),

  // ── Admin ────────────────────────────────────────────────────────────────
  login:     (email: string, password: string) =>
    apiFetch('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  admin: {
    getStats:  ()                     => apiFetch('/admin/stats'),
    getEvents: ()                     => apiFetch('/admin/events'),
    createEvent: (data: object)       => apiFetch('/admin/events', { method: 'POST', body: JSON.stringify(data) }),
    updateEvent: (slug: string, data: object) =>
      apiFetch(`/admin/events/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEvent: (slug: string)       => apiFetch(`/admin/events/${slug}`, { method: 'DELETE' }),
    toggleQuiz:  (slug: string, enabled: boolean) =>
      apiFetch(`/admin/events/${slug}/quiz-toggle`, { method: 'POST', body: JSON.stringify({ enabled }) }),

    createMember: (data: object)      => apiFetch('/admin/team', { method: 'POST', body: JSON.stringify(data) }),
    updateMember: (id: number, data: object) =>
      apiFetch(`/admin/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMember: (id: number)        => apiFetch(`/admin/team/${id}`, { method: 'DELETE' }),

    addGalleryItem: (data: object)    => apiFetch('/admin/gallery', { method: 'POST', body: JSON.stringify(data) }),
    deleteGalleryItem: (id: number)   => apiFetch(`/admin/gallery/${id}`, { method: 'DELETE' }),

    saveSettings: (data: object)      =>
      apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
};
