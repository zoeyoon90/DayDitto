'use server'

import { createClient } from './supabase/server'
import type { LoginFormData, SignupFormData } from '@/types/auth'

export async function login(data: LoginFormData): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
  if (error) throw error
}

export async function signup(data: Omit<SignupFormData, 'passwordConfirm'>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { nickname: data.nickname },
    },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
