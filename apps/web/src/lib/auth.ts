import { LoginFormData, SignupFormData } from '@/types/auth';
import { apiFetch } from './api';

export async function login(data: LoginFormData): Promise<void> {
  await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
  });
}

export async function signup(
  data: Omit<SignupFormData, 'passwordConfirm'>,
): Promise<void> {
  await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
  });
}
