'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 right-0 z-50 p-8">
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-slate-300 hover:bg-slate-800/50">
              Login
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
      
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-6xl mx-auto">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight mb-8"
        >
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            All Your Internships.
          </span>
          <br />
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            One Organized Hub.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-slate-400 text-xl md:text-2xl leading-relaxed max-w-3xl mb-12 font-light"
        >
          Stop juggling spreadsheets. Start landing offers. The all-in-one platform to track, analyze, and conquer your job search.
        </motion.p>

        {/* Call-to-Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Link href="/login">
            <Button 
              size="lg" 
              className="bg-white text-slate-950 hover:bg-slate-100 text-xl px-12 py-6 rounded-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              Get Started for Free
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
