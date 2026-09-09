export async function loginAdmin(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.ok;
  } catch {
    return false;
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