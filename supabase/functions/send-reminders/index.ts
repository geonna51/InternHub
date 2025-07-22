import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current time
    const now = new Date()
    const nowISO = now.toISOString()

    // Find reminders that are due and haven't been sent
    const { data: dueReminders, error: reminderError } = await supabaseClient
      .from('reminders')
      .select(`
        *,
        applications (
          company,
          status,
          application_link
        ),
        profiles (
          email,
          reminder_email
        )
      `)
      .lte('reminder_date', nowISO)
      .eq('email_sent', false)

    if (reminderError) {
      console.error('Error fetching reminders:', reminderError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch reminders' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders due', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    let emailsSent = 0
    const errors: string[] = []

    // Process each reminder
    for (const reminder of dueReminders) {
      try {
        const application = reminder.applications
        const profile = reminder.profiles
        
        if (!application || !profile) {
          console.error('Missing application or profile data for reminder:', reminder.id)
          continue
        }

        // Determine which email to use
        const recipientEmail = profile.reminder_email || profile.email

        // Create email content
        const emailSubject = `InternHub Reminder: Follow up on ${application.company}`
        const emailHtml = generateEmailHTML(application, reminder)
        const emailText = generateEmailText(application, reminder)

        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'InternHub <noreply@internhub.app>',
            to: [recipientEmail],
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        })

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text()
          console.error(`Failed to send email for reminder ${reminder.id}:`, errorData)
          errors.push(`Reminder ${reminder.id}: ${errorData}`)
          continue
        }

        // Mark reminder as sent
        const { error: updateError } = await supabaseClient
          .from('reminders')
          .update({ email_sent: true, updated_at: nowISO })
          .eq('id', reminder.id)

        if (updateError) {
          console.error(`Failed to mark reminder ${reminder.id} as sent:`, updateError)
          errors.push(`Failed to update reminder ${reminder.id}`)
          continue
        }

        emailsSent++
        console.log(`Successfully sent reminder for ${application.company} to ${recipientEmail}`)

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        errors.push(`Reminder ${reminder.id}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${dueReminders.length} reminders`,
        emailsSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateEmailHTML(application: any, reminder: any): string {
  const statusColors = {
    'applied': '#3B82F6',
    'under-review': '#EAB308',
    'online-assessment': '#8B5CF6',
    'phone-screen': '#6366F1',
    'technical-interview': '#06B6D4',
    'final-interview': '#F97316',
    'offer': '#10B981',
    'rejected': '#EF4444',
    'withdrawn': '#6B7280'
  }

  const statusColor = statusColors[application.status] || '#6B7280'
  const reminderDate = new Date(reminder.reminder_date).toLocaleDateString()

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InternHub Reminder</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">InternHub</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Application Reminder</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Time to follow up!</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e293b;">${application.company}</h3>
            <div style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
              <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                ${application.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            ${application.application_link ? `
              <p style="margin: 15px 0 0 0;">
                <a href="${application.application_link}" style="color: #3b82f6; text-decoration: none;">
                  View Application →
                </a>
              </p>
            ` : ''}
          </div>
          
          <p style="color: #64748b; margin: 20px 0;">
            This reminder was scheduled for ${reminderDate}. Consider reaching out to check on your application status or schedule a follow-up.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/dashboard" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Open InternHub Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
            You're receiving this because you set up a reminder in InternHub.<br>
            <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/dashboard" style="color: #64748b;">Manage your reminders</a>
          </p>
        </div>
      </body>
    </html>
  `
}

function generateEmailText(application: any, reminder: any): string {
  const reminderDate = new Date(reminder.reminder_date).toLocaleDateString()
  
  return `
InternHub - Application Reminder

Time to follow up on your application!

Company: ${application.company}
Status: ${application.status.replace('-', ' ').toUpperCase()}
Reminder Date: ${reminderDate}

${application.application_link ? `Application Link: ${application.application_link}\n` : ''}

This reminder was scheduled for ${reminderDate}. Consider reaching out to check on your application status or schedule a follow-up.

Open your InternHub dashboard: ${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/dashboard

---
You're receiving this because you set up a reminder in InternHub.
Manage your reminders: ${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/dashboard
  `.trim()
} 