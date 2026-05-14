import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useGarden } from '../contexts/GardenContext'
import { signOutUser } from '../services/auth'
import { requestPushPermission, hasPushPermission } from '../services/push'

export function Profile() {
  const { user } = useAuth()
  const { garden } = useGarden()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  useEffect(() => {
    hasPushPermission().then(setPushEnabled)
  }, [])

  async function handlePushToggle() {
    if (pushEnabled) return
    if (!user) return
    const granted = await requestPushPermission(user.uid)
    setPushEnabled(granted)
  }

  async function copyInviteCode() {
    if (!garden?.inviteCode) return
    await navigator.clipboard.writeText(garden.inviteCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-24">
      <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Profil</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* User card */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-garden-bg flex items-center justify-center text-garden-text font-bold text-lg">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{user?.displayName ?? 'Bruger'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Garden card */}
        {garden && (
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Have</p>
            <p className="font-semibold text-gray-900">{garden.name}</p>
            <div>
              <p className="text-xs text-gray-400 mb-1">Invite-kode</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-garden-text tracking-widest">
                  {garden.inviteCode}
                </span>
                <button
                  onClick={copyInviteCode}
                  className="text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1"
                >
                  {codeCopied ? 'Kopieret!' : 'Kopiér'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Del denne kode så din partner kan tilslutte sig</p>
            </div>
            <p className="text-xs text-gray-400">{garden.members.length} {garden.members.length === 1 ? 'medlem' : 'medlemmer'}</p>
          </div>
        )}

        {/* Push notifications */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Push-notifikationer</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {pushEnabled ? 'Aktiverede' : 'Ikke aktiverede'}
              </p>
            </div>
            <button
              onClick={handlePushToggle}
              disabled={pushEnabled}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                pushEnabled ? 'bg-[#1D9E75]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  pushEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOutUser()}
          className="w-full py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm"
        >
          Log ud
        </button>
      </div>
    </div>
  )
}
