import { AuthForm } from '@/components/auth-form'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-500">ThreadGenius</h1>
          <p className="mt-2 text-gray-400">Generate engaging Twitter content</p>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
