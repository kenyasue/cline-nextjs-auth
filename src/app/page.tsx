import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to Simple CMS</h1>
        <p className="text-xl mb-8">
          A simple content management system with an admin console and frontpage.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/admin"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Admin Console
          </Link>
        </div>
      </div>
    </main>
  );
}
