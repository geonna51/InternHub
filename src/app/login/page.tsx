"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else if (data.user) {
      setMessage('Login successful! Redirecting...');
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else if (data.user) {
      if (data.user.email_confirmed_at) {
        setMessage('Account created! Redirecting...');
        router.push('/dashboard');
        router.refresh();
      } else {
        setMessage('Please check your email and click the confirmation link to complete signup.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            InternHub
          </h1>
          <p className="mt-2 text-gray-400">Sign in to your account or create a new one</p>
        </div>
        <div className="space-y-4">
        <input
          type='email'
          placeholder='Email'
          className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type='password'
          placeholder='Password'
          className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className='text-red-400 text-sm'>{error}</p>}
        {message && <p className='text-green-400 text-sm'>{message}</p>}
        <div className='flex gap-3'>
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            onClick={handleSignup}
            disabled={loading || !email || !password}
            className='flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium'
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
        <div className="text-center">
          <Link href='/' className='text-sm text-gray-400 hover:text-gray-300 transition-colors'>
          Go back to home
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
} 