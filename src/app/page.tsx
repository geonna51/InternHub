import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }}></div>
      </div>

      <div className="text-center space-y-12 max-w-4xl relative z-10 animate-fade-in">
        {/* Main heading */}
        <div className="space-y-6">
          <h1 className="text-7xl md:text-8xl font-black tracking-tight">
            <span className="gradient-text">Intern</span>
            <span className="gradient-text-blue">Hub</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Description */}
        <p className="text-2xl md:text-3xl text-gray-300 font-light leading-relaxed max-w-3xl mx-auto">
          Stay organized through your internship search. 
          <span className="text-white font-medium"> Track applications, manage deadlines, and land your next opportunity.</span>
        </p>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 mb-16">
          <div className="glass-card rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-2xl">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-gray-400">See where your applications stand and identify opportunities</p>
          </div>
          <div className="glass-card rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-2xl">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">Stay Organized</h3>
            <p className="text-gray-400">Keep all your application details and notes in one place</p>
          </div>
          <div className="glass-card rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-2xl">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-white mb-2">Never Miss Out</h3>
            <p className="text-gray-400">Get reminded about follow-ups and important deadlines</p>
          </div>
        </div>

        {/* Call to action */}
        <Link href="/login" className="inline-block animate-scale-in">
          <button className="group relative px-12 py-5 btn-glass rounded-2xl text-xl font-semibold text-white overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              Get Started
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
        </Link>

        {/* Subtle bottom text */}
        <p className="text-gray-500 text-sm mt-12">
          Built for students, by a student
        </p>
      </div>
    </div>
  );
}
