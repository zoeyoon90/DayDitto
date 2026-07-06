'use server'

import { createClient } from './supabase/server'
import type { LoginFormData, SignupFormData } from '@/types/auth'

export async function login(data: LoginFormData): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
  return { error: error?.message ?? null }
}

export async function signup(data: Omit<SignupFormData, 'passwordConfirm'>): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { nickname: data.nickname },
    },
  })
  return { error: error?.message ?? null }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
