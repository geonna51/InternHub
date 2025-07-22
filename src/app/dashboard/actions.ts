'use server';

import { createServerSupabaseClient } from '@/utils/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const applicationSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['Applied', 'Interviewing', 'Offer', 'Rejected']),
  link: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  referral: z.boolean(),
  referral_source: z.string().optional(),
  reminder_enabled: z.boolean(),
  follow_up_date: z.string().optional(),
});

type FormState = {
  errors?: {
    company?: string[];
    role?: string[];
    status?: string[];
    link?: string[];
    notes?: string[];
    referral?: string[];
    referral_source?: string[];
    reminder_enabled?: string[];
    follow_up_date?: string[];
    general?: string[];
  };
  success: boolean;
};

export async function addApplication(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      errors: { general: ['You must be logged in.'] },
      success: false,
    };
  }

  const validatedFields = applicationSchema.safeParse({
    company: formData.get('company'),
    role: formData.get('role'),
    status: formData.get('status'),
    link: formData.get('link'),
    notes: formData.get('notes'),
    referral: formData.get('referral') === 'on',
    referral_source: formData.get('referral_source'),
    reminder_enabled: formData.get('reminder_enabled') === 'on',
    follow_up_date: formData.get('follow_up_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const {
    company,
    role,
    status,
    link,
    notes,
    referral,
    referral_source,
    reminder_enabled,
    follow_up_date,
  } = validatedFields.data;

  const { error } = await supabase.from('applications').insert({
    user_id: user.id,
    company,
    role,
    status,
    link: link || null,
    notes: notes || null,
    referral,
    referral_source: referral ? referral_source : null,
    reminder_enabled,
    follow_up_date: reminder_enabled && follow_up_date ? follow_up_date : null,
    date_applied: new Date().toISOString(),
  });

  if (error) {
    return {
      errors: { general: ['Failed to add application to the database.'] },
      success: false,
    };
  }

  revalidatePath('/dashboard');
  return {
    success: true,
  };
}

export async function deleteApplication(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in' };
  }

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: 'Failed to delete application' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
} 