import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">InternHub</h1>
      <Link href="/login">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Login / Setup
        </button>
      </Link>
    </main>
  );
}
