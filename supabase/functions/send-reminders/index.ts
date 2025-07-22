import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const resend = new Resend(RESEND_API_KEY)

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date().toISOString().split('T')[0];

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        profiles:user_id ( email )
      `)
      .eq('follow_up_date', today)
      .eq('reminder_enabled', true)

    if (error) {
      throw error;
    }

    if (applications && applications.length > 0) {
      for (const app of applications) {
        if (app.profiles && 'email' in app.profiles) {
          await resend.emails.send({
            from: 'InternHub <reminders@resend.dev>',
            to: [app.profiles.email],
            subject: `Follow-up Reminder: ${app.role} at ${app.company}`,
            html: `
              <h1>InternHub Reminder</h1>
              <p>This is a reminder to follow up on your application for the <strong>${app.role}</strong> position at <strong>${app.company}</strong>.</p>
              <p><strong>Application Date:</strong> ${new Date(app.date_applied).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${app.status}</p>
              <p>Good luck!</p>
              <a href="${Deno.env.get('SITE_URL')}/dashboard">View in InternHub</a>
            `,
          });
        }
      }
    }

    return new Response(JSON.stringify({ message: `${applications?.length || 0} reminders sent.` }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}) 