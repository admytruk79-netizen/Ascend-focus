export type CircleDraft = { name: string; description: string; visibility: 'private' | 'discoverable'; rulesAccepted: boolean };
export type Circle = Omit<CircleDraft, 'rulesAccepted'> & { id: string; ownerId: string; createdAt: string };
export type MembershipRole = 'owner' | 'moderator' | 'member';
export type CommunityStatus = 'offline' | 'connected';
export interface CommunityService {
  readonly status: CommunityStatus;
  createCircle(draft: CircleDraft): Promise<Circle>;
  listCircles(): Promise<Circle[]>;
}

export function validateCircle(draft: CircleDraft): string | null {
  if (draft.name.trim().length < 3 || draft.name.trim().length > 80) return 'Use a circle name between 3 and 80 characters.';
  if (draft.description.trim().length < 20 || draft.description.trim().length > 1000) return 'Use a description between 20 and 1,000 characters.';
  if (!['private', 'discoverable'].includes(draft.visibility)) return 'Choose a valid visibility.';
  if (!draft.rulesAccepted) return 'Accept the community rules before creating a circle.';
  return null;
}

// Fail closed: a browser draft must never become a pretend server-side circle.
export const offlineCommunity: CommunityService = {
  status: 'offline',
  async createCircle() { throw new Error('Community is offline. Your circle has not been published.'); },
  async listCircles() { return []; },
};

export function readCircleDraft(raw: string | null): CircleDraft | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const d = value as Record<string, unknown>;
    if (typeof d.name !== 'string' || d.name.length > 80 || typeof d.description !== 'string' || d.description.length > 1000 || !['private', 'discoverable'].includes(String(d.visibility)) || typeof d.rulesAccepted !== 'boolean') return null;
    return { name: d.name, description: d.description, visibility: d.visibility as CircleDraft['visibility'], rulesAccepted: d.rulesAccepted };
  } catch { return null; }
}
