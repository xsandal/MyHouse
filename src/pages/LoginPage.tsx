import { useState } from 'react'
import { signInWithGoogle } from '../services/auth'

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch {
      setError('Noget gik galt. Prøv igen.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-garden-bg flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <div className="text-7xl mb-4">🌿</div>
        <h1 className="text-3xl font-bold text-garden-text">MyHouse</h1>
        <p className="text-garden-text/70 mt-2">Din personlige have- og husassistent</p>
      </div>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full max-w-xs bg-white rounded-2xl px-6 py-4 flex items-center justify-center gap-3 shadow-sm font-semibold text-gray-700 active:scale-95 transition-transform disabled:opacity-60"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? 'Logger ind…' : 'Log ind med Google'}
      </button>
      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </div>
  )
}
