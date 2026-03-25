import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ── Public hooks ────────────────────────────────────────────────────────────

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: api.getEvents, staleTime: 1000 * 60 * 5 });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.getEvent(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeam() {
  return useQuery({ queryKey: ['team'], queryFn: api.getTeam, staleTime: 1000 * 60 * 5 });
}

export function useGallery() {
  return useQuery({ queryKey: ['gallery'], queryFn: api.getGallery, staleTime: 1000 * 60 * 5 });
}

export function useQuiz(slug: string) {
  return useQuery({
    queryKey: ['quiz', slug],
    queryFn: () => api.getQuiz(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: api.getSettings, staleTime: 1000 * 60 * 10 });
}

// ── Admin hooks ─────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({ 
    queryKey: ['admin-stats'], 
    queryFn: api.admin.getStats, 
    staleTime: 0,
    enabled: !!localStorage.getItem('gdg_admin_token')
  });
}

export function useAdminEvents() {
  return useQuery({ 
    queryKey: ['admin-events'], 
    queryFn: api.admin.getEvents, 
    staleTime: 0,
    enabled: !!localStorage.getItem('gdg_admin_token')
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.admin.createEvent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); qc.invalidateQueries({ queryKey: ['admin-events'] }); },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: object }) => api.admin.updateEvent(slug, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); qc.invalidateQueries({ queryKey: ['admin-events'] }); },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.admin.deleteEvent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); qc.invalidateQueries({ queryKey: ['admin-events'] }); },
  });
}

export function useToggleQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, enabled }: { slug: string; enabled: boolean }) => api.admin.toggleQuiz(slug, enabled),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); },
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.admin.createMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => api.admin.updateMember(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.admin.deleteMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  });
}

export function useAddGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.admin.addGalleryItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.admin.deleteGalleryItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.admin.saveSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
export function useUpdateQuizState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, state }: { slug: string; state: object }) => api.admin.updateQuizState(slug, state),
    onSuccess: (_, { slug }) => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      qc.invalidateQueries({ queryKey: ['event', slug] });
    },
  });
}
