export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          🚀 ML Engineer Roadmap
        </h1>
        <p className="text-center text-lg mb-4">
          Your comprehensive guide to mastering Machine Learning and AI
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">📚 Structured Learning</h2>
            <p className="text-gray-600">6-phase roadmap from beginner to expert</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">🎯 Track Progress</h2>
            <p className="text-gray-600">Monitor your learning journey</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">🏆 Earn Badges</h2>
            <p className="text-gray-600">Gamified learning experience</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ✅ Infrastructure setup complete! Ready for development.
          </p>
        </div>
      </div>
    </main>
  )
}
