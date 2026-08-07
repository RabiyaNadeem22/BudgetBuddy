const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AuthUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  token?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  settings?: Record<string, unknown>;
  token: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data as T;
}

export async function signupUser(payload: { name: string; email: string; password: string }) {
  return request<AuthResponse>('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return request<AuthResponse>('/api/users/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
