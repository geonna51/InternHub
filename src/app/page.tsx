import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          InternHub
        </h1>
        <p className="text-xl text-gray-300">
          Track every application, deadline, and interview in a single place — so you can focus on landing the offer.
        </p>
        <Link href="/login" className="inline-block">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
}
