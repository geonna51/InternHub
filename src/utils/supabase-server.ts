import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await nextCookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore if called from a Server Component
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore if called from a Server Component
          }
        },
      },
    }
  );
} 