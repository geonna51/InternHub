'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/utils/supabase';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const supabase = createClient();
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.refresh();
        router.push('/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-slate-950/50">
        <CardHeader className="text-center space-y-4 pt-8 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto w-14 h-14 bg-gradient-to-br from-white to-slate-200 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Shield className="w-7 h-7 text-slate-950" />
          </motion.div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-white">
              {view === 'sign_in' ? 'Welcome Back' : 'Create an Account'}
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              {view === 'sign_in' ? 'Sign in to access your dashboard.' : 'Start tracking your applications.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ffffff',
                    brandAccent: '#f1f5f9',
                    brandButtonText: '#0f172a',
                    defaultButtonBackground: '#1e293b',
                    defaultButtonBackgroundHover: '#334155',
                    inputBackground: '#0f172a',
                    inputBorder: '#475569',
                    inputText: '#f1f5f9',
                    inputLabelText: '#cbd5e1',
                  },
                  radii: {
                    borderRadiusButton: '10px',
                    inputBorderRadius: '10px',
                  },
                },
              },
              className: {
                container: 'space-y-6',
                button: 'font-semibold py-3',
                input: 'py-3 font-medium',
                label: 'font-semibold text-slate-300',
              },
            }}
            providers={['github']}
            view={view}
            key={view}
            showLinks={false}
          />
          <div className="text-center">
            <button
              onClick={() => setView(view === 'sign_in' ? 'sign_up' : 'sign_in')}
              className="group inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              {view === 'sign_in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 