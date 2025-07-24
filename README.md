# InternHub

**InternHub** is a simple, modern web app to help you organize, track, and manage your internship applications—all in one place.

👉 **Try it live:**  
[https://intern-hub-zeta.vercel.app/](https://intern-hub-zeta.vercel.app/)

---

## What is InternHub?

InternHub is built for students who want to keep their internship search organized and stress-free. No more messy spreadsheets or sticky notes—just a clean dashboard for your applications, deadlines, and reminders.

- **Track your applications** and their status
- **Set reminders** for follow-ups and deadlines
- **See your progress** with visual analytics
- **Keep notes and links** for each opportunity

---

## Features

- **Dashboard:** See all your applications at a glance
- **Status Pipeline:** Visualize where each application stands (applied, interview, offer, etc.)
- **Reminders:** Get notified about follow-ups and deadlines
- **Notes & Links:** Store important details for each application
- **Analytics:** See your progress and stats
- **Modern UI:** Clean, responsive, and easy to use

---

## Want to Run It Yourself?

If you want to run InternHub locally, here’s how:

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/internhub.git
   cd internhub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env.local` file with your Supabase project info:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database:**  
   - Go to your Supabase dashboard
   - Open the SQL Editor
   - Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`

5. **Start the app:**
   ```bash
   npm run dev
   ```
   Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Email:** Resend API (for reminders)
- **Charts:** Recharts

---

## License

MIT

---

**Built by a student, for students.**
