import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'

export default function Home() {
  const t = useTranslations()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          🚀 {t('roadmap.title')}
        </h1>
        <p className="text-center text-lg mb-4">
          {t('roadmap.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">📚 Structured Learning</h2>
            <p className="text-gray-600">6-phase roadmap from beginner to expert</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🎯 Track Progress</h2>
            <p className="text-gray-600">Monitor your learning journey</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🏆 Earn Badges</h2>
            <p className="text-gray-600">Gamified learning experience</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/roadmap"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('nav.roadmap')}
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('nav.dashboard')}
          </a>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ✅ Infrastructure setup complete! Ready for development.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            🌍 Multi-language support: EN / TR
          </p>
        </div>
      </div>
    </main>
  )
}
