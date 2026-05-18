import { supabase } from './supabase'

export const TEST_PASSWORD = 'test123'

function toEmail(usernameOrEmail) {
  return usernameOrEmail.includes('@')
    ? usernameOrEmail
    : `${usernameOrEmail.trim().toLowerCase()}@local.test`
}

export async function signUp(username, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email: toEmail(username),
    password: TEST_PASSWORD,
    options: { data: { display_name: displayName || username } },
  })
  if (error) throw error
  return data
}

export async function signIn(username, password = TEST_PASSWORD) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}
