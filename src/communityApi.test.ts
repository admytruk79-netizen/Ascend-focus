import { afterEach, describe, expect, it, vi } from 'vitest';
import { communityApi, CommunityApiError } from './communityApi';

afterEach(() => vi.unstubAllGlobals());
function mockFetch(status: number, body: unknown) {
  vi.stubGlobal('window', { setTimeout, clearTimeout });
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}
describe('community API boundary', () => {
  it('creates circles with cookie credentials, CSRF header and retry identity', async () => {
    const fetcher = mockFetch(201, { circle: { id: 'created' } });
    const draft = { name: 'Quiet attention', description: 'Consensual daily observation practice.', visibility: 'private' as const, rulesAccepted: true };
    await communityApi.createCircle(draft, 'same-retry-key-1234');
    expect(fetcher).toHaveBeenCalledWith('/api/circles', expect.objectContaining({ method: 'POST', credentials: 'same-origin', body: JSON.stringify(draft), headers: expect.objectContaining({ 'X-Ascend-Request': '1', 'Idempotency-Key': 'same-retry-key-1234' }) }));
  });
  it('keeps permission errors as failures rather than successful empty results', async () => {
    mockFetch(403, { error: 'Active circle membership is required.' });
    await expect(communityApi.posts('private-circle')).rejects.toMatchObject({ status: 403, message: 'Active circle membership is required.' });
  });
  it('distinguishes an expired session from a connection problem', async () => {
    mockFetch(401, { error: 'Sign in to continue.' });
    await expect(communityApi.session()).rejects.toBeInstanceOf(CommunityApiError);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
    await expect(communityApi.health()).rejects.toThrow('Cannot reach the community server');
  });
  it('sends report reasons without private journal fields', async () => {
    const fetcher = mockFetch(201, { ok: true });
    await communityApi.report('circle', 'post', 'Consent concern in this discussion.');
    expect(fetcher).toHaveBeenCalledWith('/api/circles/circle/posts/post/report', expect.objectContaining({ body: JSON.stringify({ reason: 'Consent concern in this discussion.' }) }));
  });
});
