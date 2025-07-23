# InternHub

All your internship applications, one organized hub.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

4. Link to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

5. Run the migration:
   ```bash
   supabase db push
   ```

#### Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the SQL script

#### Quick Fix if You Get Schema Errors

If you get errors like "Could not find the 'application_date' column", it means the database schema hasn't been applied yet:

1. **Manual Schema Setup** (Easiest):
   - Go to your Supabase project dashboard
   - Click **SQL Editor** in the sidebar
   - Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste it into the SQL editor and click **Run**

2. **Verify Tables Created**:
   - Go to **Table Editor** in Supabase dashboard
   - You should see: `profiles`, `applications`, `reminders` tables

3. **If tables exist but missing columns**:
   ```sql
   -- Run this in SQL Editor to check your schema
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'applications';
   ```

### 3. Email System Setup

#### Option A: Using Resend (Recommended)

1. Sign up for [Resend](https://resend.com) and get your API key
2. In your Supabase project dashboard, go to Settings → Edge Functions
3. Add environment variable:
   - `RESEND_API_KEY`: Your Resend API key
   - `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `https://yourdomain.com` or `http://localhost:3000` for development)

4. Deploy the Edge Functions:
   ```bash
   supabase functions deploy send-reminders
   supabase functions deploy test-reminder
   ```

5. Set up a cron job (in Supabase Dashboard → Database → Cron):
   ```sql
   -- Run every hour to check for due reminders
   SELECT cron.schedule(
     'send-reminders',
     '0 * * * *',
     $$ SELECT net.http_post(
         url := 'https://your-project-ref.supabase.co/functions/v1/send-reminders',
         headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     ) $$
   );
   ```

#### Option B: Alternative Email Providers

You can modify the Edge Function to use other providers like SendGrid, Mailgun, or AWS SES by updating the email sending logic in `supabase/functions/send-reminders/index.ts`.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## Testing Email Reminders

1. Create an application with a reminder set for the current time or past
2. Click the "Test Email" button in the dashboard header
3. Check your email for the reminder
4. Check the application card - sent reminders will show as "Sent" (green), pending ones as "Pending" (yellow)

## Database Schema

The application uses three main tables:

- **profiles**: User profile information (extends Supabase auth.users)
- **applications**: Internship applications with status tracking
- **reminders**: Email reminders for follow-ups

All tables include Row Level Security (RLS) policies to ensure users can only access their own data.

## Features

- ✅ User authentication (signup/login)
- ✅ Application tracking with status updates
- ✅ Bulk operations (status updates, reminders)
- ✅ Analytics dashboard with charts
- ✅ Email reminder system
- ✅ Settings management
- ✅ Responsive design

## Email System Features

- **Automated Reminders**: Set reminders for 1 week, 2 weeks, 3 weeks, 1 month, 2 months, or custom dates
- **Beautiful HTML Emails**: Professional-looking emails with company branding
- **Status Tracking**: See which reminders have been sent vs pending
- **Flexible Email Options**: Use main email or separate reminder email
- **Bulk Operations**: Set reminders for multiple applications at once
- **Test Functionality**: Test email system with a button click

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend API
- **Background Jobs**: Supabase Edge Functions + Cron
- **Charts**: Recharts
- **Date Picker**: React DatePicker
