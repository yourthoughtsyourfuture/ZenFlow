import { ZenderAI } from '@/components/zender-ai'
import { UserDashboard } from '@/components/user-dashboard'
import { ContentBrowser } from '@/components/content-browser'
import { AuthButtons } from '@/components/auth-buttons'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to ZenFlow</h1>
        <AuthButtons />
        <div className="space-y-8">
          <ZenderAI />
          <UserDashboard />
          <ContentBrowser />
        </div>
      </div>
    </main>
  )
}
