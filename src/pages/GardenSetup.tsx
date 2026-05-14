import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createGarden, joinGardenByCode } from '../services/firestore'

export function GardenSetup() {
  const { user } = useAuth()
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [gardenName, setGardenName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !gardenName.trim()) return
    setSaving(true)
    setError('')
    try {
      await createGarden(user.uid, gardenName.trim())
    } catch {
      setError('Kunne ikke oprette have. Prøv igen.')
      setSaving(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !inviteCode.trim()) return
    setSaving(true)
    setError('')
    try {
      const id = await joinGardenByCode(user.uid, inviteCode.trim())
      if (!id) {
        setError('Ugyldig kode. Tjek at du har tastet rigtigt.')
        setSaving(false)
      }
    } catch {
      setError('Noget gik galt. Prøv igen.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🌱</div>
        <h1 className="text-2xl font-bold text-gray-900">Kom i gang</h1>
        <p className="text-gray-500 mt-2 text-sm">Opret en have eller deltag i en eksisterende</p>
      </div>

      {mode === 'choose' && (
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => setMode('create')}
            className="w-full bg-garden-bg text-garden-text rounded-2xl px-6 py-4 font-semibold text-left flex items-center gap-3"
          >
            <span className="text-2xl">🏡</span>
            <div>
              <p className="font-semibold">Opret ny have</p>
              <p className="text-xs opacity-70 font-normal">Start fra bunden</p>
            </div>
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full bg-house-bg text-house-text rounded-2xl px-6 py-4 font-semibold text-left flex items-center gap-3"
          >
            <span className="text-2xl">🔑</span>
            <div>
              <p className="font-semibold">Deltag med kode</p>
              <p className="text-xs opacity-70 font-normal">Brug en invite-kode</p>
            </div>
          </button>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreate} className="w-full max-w-xs space-y-4">
          <button type="button" onClick={() => setMode('choose')} className="text-sm text-gray-400 flex items-center gap-1">
            ← Tilbage
          </button>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Havenavn *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75]"
              value={gardenName}
              onChange={(e) => setGardenName(e.target.value)}
              placeholder="f.eks. Vores have"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving || !gardenName.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#1D9E75] disabled:opacity-50"
          >
            {saving ? 'Opretter…' : 'Opret have'}
          </button>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className="w-full max-w-xs space-y-4">
          <button type="button" onClick={() => setMode('choose')} className="text-sm text-gray-400 flex items-center gap-1">
            ← Tilbage
          </button>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Invite-kode *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm uppercase tracking-widest outline-none focus:border-[#378ADD]"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="f.eks. ROSE42"
              maxLength={8}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving || !inviteCode.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#378ADD] disabled:opacity-50"
          >
            {saving ? 'Søger…' : 'Deltag'}
          </button>
        </form>
      )}
    </div>
  )
}
