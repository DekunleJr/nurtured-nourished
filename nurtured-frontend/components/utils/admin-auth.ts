export async function loginAdmin(email: string, password: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      return { ok: true, message: '' };
    }
    // Surface the backend's specific reason (detail) when available.
    return { ok: false, message: data.detail || data.error || `Login failed (${response.status})` };
  } catch {
    return { ok: false, message: 'Network error — could not reach the login API' };
  }
}

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/verify', {
      credentials: 'include',
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include',
  });
  // Navigation is handled by the calling component via useRouter.
}