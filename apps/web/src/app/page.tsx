export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8">
          🚀 ML Engineer Roadmap
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          Your comprehensive learning platform for Machine Learning, AI, and Data Science
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🤖 Machine Learning</h2>
            <p className="text-muted-foreground">
              Master ML algorithms, frameworks, and production deployment
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🧠 AI Engineering</h2>
            <p className="text-muted-foreground">
              Build intelligent systems with cutting-edge AI technologies
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📊 Data Science</h2>
            <p className="text-muted-foreground">
              Extract insights from data and tell compelling stories
            </p>
          </div>
        </div>
        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            Platform is under active development • MVP Coming Soon
          </p>
        </div>
      </div>
    </main>
  )
}
