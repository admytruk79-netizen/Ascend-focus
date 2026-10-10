import type { CircleDraft } from './community';

export type CommunityUser = { id: string; username: string; displayName: string };
export type ServerCircle = { id: string; name: string; description: string; visibility: 'private' | 'discoverable'; createdAt: string; membership: { role: 'owner' | 'moderator' | 'member'; state: 'active' | 'pending' | 'banned' } | null };
export type CommunityPost = { id: string; authorId: string | null; author: string; body: string; hidden: boolean; createdAt: string };
export type CircleMember = { id: string; displayName: string; role: 'owner' | 'moderator' | 'member'; state: 'active' | 'pending' | 'banned' };
export type CommunityReport = { id: string; postId: string; reason: string; body: string; createdAt: string };
export type BlockedUser = { id: string; displayName: string };
export class CommunityApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
export async function communityRequest<T>(path: string, method = 'GET', body?: unknown, headers?: Record<string, string>): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`/api${path}`, { method, credentials: 'same-origin', signal: controller.signal, headers: method === 'GET' ? headers : { 'Content-Type': 'application/json', 'X-Ascend-Request': '1', ...headers }, body: method === 'GET' ? undefined : JSON.stringify(body ?? {}) });
    const value: unknown = await response.json();
    if (!response.ok) {
      const message = value && typeof value === 'object' && 'error' in value && typeof value.error === 'string' ? value.error : 'Community request failed.';
      throw new CommunityApiError(response.status, message);
    }
    return value as T;
  } catch (error) {
    if (error instanceof CommunityApiError) throw error;
    throw new Error('Cannot reach the community server. Your text has been kept.');
  } finally { window.clearTimeout(timeout); }
}
export const communityApi = {
  health: () => communityRequest<{ status: string; service: string; version: number }>('/health'),
  session: () => communityRequest<{ user: CommunityUser }>('/auth/session'),
  login: (username: string, password: string) => communityRequest<{ user: CommunityUser }>('/auth/login', 'POST', { username, password }),
  register: (username: string, displayName: string, password: string, adultAccepted: boolean, rulesAccepted: boolean) => communityRequest<{ user: CommunityUser }>('/auth/register', 'POST', { username, displayName, password, adultAccepted, rulesAccepted }),
  logout: () => communityRequest('/auth/logout', 'POST'),
  circles: () => communityRequest<{ circles: ServerCircle[] }>('/circles'),
  createCircle: (draft: CircleDraft, key: string) => communityRequest<{ circle: ServerCircle }>('/circles', 'POST', draft, { 'Idempotency-Key': key }),
  join: (id: string) => communityRequest(`/circles/${id}/join`, 'POST'),
  leave: (id: string) => communityRequest(`/circles/${id}/leave`, 'POST'),
  deleteCircle: (id: string) => communityRequest(`/circles/${id}`, 'DELETE'),
  invite: (id: string) => communityRequest<{ token: string }>(`/circles/${id}/invitations`, 'POST'),
  accept: (token: string) => communityRequest('/invitations/accept', 'POST', { token }),
  posts: (id: string) => communityRequest<{ posts: CommunityPost[] }>(`/circles/${id}/posts`),
  post: (id: string, body: string) => communityRequest(`/circles/${id}/posts`, 'POST', { body }),
  deletePost: (id: string, postId: string) => communityRequest(`/circles/${id}/posts/${postId}`, 'DELETE'),
  report: (id: string, postId: string, reason: string) => communityRequest(`/circles/${id}/posts/${postId}/report`, 'POST', { reason }),
  hide: (id: string, postId: string, reason: string) => communityRequest(`/circles/${id}/posts/${postId}/hide`, 'POST', { reason }),
  members: (id: string) => communityRequest<{ members: CircleMember[] }>(`/circles/${id}/members`),
  membership: (id: string, userId: string, action: string, reason: string) => communityRequest(`/circles/${id}/members/${userId}`, 'PATCH', { action, reason }),
  reports: (id: string) => communityRequest<{ reports: CommunityReport[] }>(`/circles/${id}/reports`),
  resolve: (id: string, reportId: string, reason: string) => communityRequest(`/circles/${id}/reports/${reportId}/resolve`, 'POST', { reason }),
  blocks: () => communityRequest<{ blocks: BlockedUser[] }>('/blocks'),
  block: (id: string) => communityRequest(`/blocks/${id}`, 'POST'),
  unblock: (id: string) => communityRequest(`/blocks/${id}`, 'DELETE'),
  deleteAccount: (password: string) => communityRequest('/account', 'DELETE', { password }),
};
