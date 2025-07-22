export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          reminder_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          reminder_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          reminder_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          application_date: string | null;
          referral: boolean;
          referred_by: string | null;
          application_link: string | null;
          status: 'applied' | 'under-review' | 'online-assessment' | 'phone-screen' | 'technical-interview' | 'final-interview' | 'offer' | 'rejected' | 'withdrawn';
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company: string;
          application_date?: string | null;
          referral?: boolean;
          referred_by?: string | null;
          application_link?: string | null;
          status?: 'applied' | 'under-review' | 'online-assessment' | 'phone-screen' | 'technical-interview' | 'final-interview' | 'offer' | 'rejected' | 'withdrawn';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company?: string;
          application_date?: string | null;
          referral?: boolean;
          referred_by?: string | null;
          application_link?: string | null;
          status?: 'applied' | 'under-review' | 'online-assessment' | 'phone-screen' | 'technical-interview' | 'final-interview' | 'offer' | 'rejected' | 'withdrawn';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          reminder_date: string;
          email_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          reminder_date: string;
          email_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string;
          reminder_date?: string;
          email_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}; 