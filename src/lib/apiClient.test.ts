import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiFetch, ApiError } from './apiClient';

/**
 * apiFetch boundary / envelope parsing testleri.
 * Global fetch mock'lanır; gerçek network yok.
 */
describe('apiFetch', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Auth header testlerde önemsiz — localStorage temizle
    try { localStorage.clear(); } catch { /* happy-dom eksikse sessizce geç */ }
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function mockFetch(response: Partial<Response> & { jsonData?: unknown; text?: string; throwOnJson?: boolean }) {
    const {
      status = 200,
      ok = status >= 200 && status < 300,
      jsonData,
      text,
      throwOnJson = false,
    } = response;

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok,
      status,
      headers: new Headers(),
      json: async () => {
        if (throwOnJson) throw new SyntaxError('Unexpected end of JSON input');
        return jsonData;
      },
      text: async () => text ?? JSON.stringify(jsonData),
    } as unknown as Response);
  }

  // ================================================================
  // Happy path
  // ================================================================

  it('returns envelope.data on success', async () => {
    mockFetch({ status: 200, jsonData: { success: true, data: { id: 42, name: 'test' } } });

    const result = await apiFetch<{ id: number; name: string }>('/endpoint');

    expect(result).toEqual({ id: 42, name: 'test' });
  });

  // ================================================================
  // Error envelope: nested shape (new .NET middleware)
  // ================================================================

  it('extracts message from nested error.message (new shape)', async () => {
    mockFetch({
      status: 400,
      jsonData: {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email zorunludur' },
      },
    });

    await expect(apiFetch('/endpoint')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Email zorunludur',
    });
  });

  it('exposes structured error payload in ApiError.data for consumers', async () => {
    mockFetch({
      status: 422,
      jsonData: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          errors: { email: ['required'] },
        },
        traceId: 'abc-123',
      },
    });

    try {
      await apiFetch('/endpoint');
      expect.fail('apiFetch should have thrown ApiError');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const apiErr = e as ApiError;
      expect(apiErr.status).toBe(422);
      const envelope = apiErr.data as {
        error?: { errors?: Record<string, string[]> };
        traceId?: string;
      };
      expect(envelope.error?.errors?.email?.[0]).toBe('required');
      expect(envelope.traceId).toBe('abc-123');
    }
  });

  // ================================================================
  // Error envelope: flat shape (legacy / controller-manual returns)
  // ================================================================

  it('falls back to envelope.message when error object absent', async () => {
    mockFetch({
      status: 400,
      jsonData: { success: false, message: 'Eski usul düz mesaj' },
    });

    await expect(apiFetch('/endpoint')).rejects.toMatchObject({
      message: 'Eski usul düz mesaj',
      status: 400,
    });
  });

  it('falls back to generic message when envelope has no message at all', async () => {
    mockFetch({ status: 500, jsonData: { success: false } });

    await expect(apiFetch('/endpoint')).rejects.toMatchObject({
      message: 'Request failed with status 500',
    });
  });

  // ================================================================
  // 204 No Content — DELETE endpoints
  // ================================================================

  it('returns undefined for 204 No Content without attempting JSON parse', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
      json: async () => {
        throw new SyntaxError('Should not be called for 204');
      },
      text: async () => '',
    } as unknown as Response);
    globalThis.fetch = fetchMock;

    const result = await apiFetch<null>('/resource/1', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });

  // ================================================================
  // Boundary / resilience
  // ================================================================

  it('throws ApiError when response body is not valid JSON', async () => {
    mockFetch({ status: 500, throwOnJson: true });

    await expect(apiFetch('/endpoint')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: expect.stringContaining('geçersiz yanıt'),
    });
  });

  it('throws ApiError on 200 OK but success=false (business error with 200 status)', async () => {
    // WeatherController gibi controller'lar `Ok(new { success=false, ... })` dönebilir
    mockFetch({
      status: 200,
      jsonData: {
        success: false,
        message: 'Hava durumu verisi alınamadı.',
      },
    });

    await expect(apiFetch('/weather')).rejects.toMatchObject({
      status: 200,
      message: 'Hava durumu verisi alınamadı.',
    });
  });

  it('throws ApiError on non-ok status even when success=true is present', async () => {
    // Defensive — 4xx ama gövde {success:true} gibi anormal durumlar
    mockFetch({
      status: 404,
      jsonData: { success: true, data: null },
    });

    // success=true olduğu için envelope.data (null) dönmeli — ok=false olsa bile?
    // Karar: response.ok false ise throw, aksi halde data dön. Test mevcut davranışı belirtir.
    await expect(apiFetch('/endpoint')).rejects.toMatchObject({ status: 404 });
  });
});
