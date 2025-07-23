# InternHub

A modern application tracking system for students managing their internship search. Stay organized, track your progress, and never miss a follow-up.

![InternHub Preview](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=InternHub+Preview)

## Features

- **Application Tracking**: Organize all your applications with status updates and notes
- **Analytics Dashboard**: Visualize your progress with interactive charts and metrics
- **Email Reminders**: Automated follow-up reminders for applications
- **Bulk Operations**: Update multiple applications and set reminders efficiently
- **Modern UI**: Clean, responsive design with glassmorphism effects
- **Secure**: User authentication and data protection with Supabase

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Supabase account
- A Resend account (for email features)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/internhub.git
cd internhub
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the database migration in your Supabase SQL Editor:

```bash
# Copy contents of supabase/migrations/001_initial_schema.sql
# Paste and run in Supabase Dashboard > SQL Editor
```

### 4. Email Configuration (Optional)

1. Get your [Resend API key](https://resend.com)
2. Add to Supabase Dashboard > Settings > Edge Functions:
   - `RESEND_API_KEY`: Your Resend API key

3. Deploy the email function:
```bash
supabase functions deploy send-reminders
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to start using InternHub!

## Project Structure

```
internhub/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── dashboard/       # Main application interface
│   │   ├── login/          # Authentication pages
│   │   └── globals.css     # Global styles with modern effects
│   └── lib/                # Shared utilities and configurations
├── supabase/
│   ├── migrations/         # Database schema files
│   └── functions/          # Edge functions for email system
└── public/                 # Static assets
```

## Database Schema

Three main tables power the application:

- **`profiles`**: User information extending Supabase auth
- **`applications`**: Internship applications with status tracking  
- **`reminders`**: Email reminders with scheduling

All tables use Row Level Security (RLS) for data protection.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app works on any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom animations
- **Charts**: Recharts
- **Email**: Resend API
- **Deployment**: Vercel

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- [Issues](https://github.com/yourusername/internhub/issues)
- [Discussions](https://github.com/yourusername/internhub/discussions)
