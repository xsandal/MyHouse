import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../services/firebase'
import { useItems } from '../hooks/useItems'
import { useItemReminders } from '../hooks/useReminders'
import { useExperiences } from '../hooks/useExperiences'
import { useGarden } from '../contexts/GardenContext'
import { useAuth } from '../contexts/AuthContext'
import { completeReminder, deleteReminder, deleteItem, deleteExperience } from '../services/firestore'
import { StatusBadge } from '../components/StatusBadge'
import { AddReminderForm } from '../components/forms/AddReminderForm'
import { AddExperienceForm } from '../components/forms/AddExperienceForm'
import { EditItemForm } from '../components/forms/EditItemForm'
import type { CareAdvice } from '../types'
import { getReminderStatus } from '../types'

type Tab = 'info' | 'notes' | 'reminders'

export function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { gardenId } = useGarden()
  const { items } = useItems(gardenId)
  const reminders = useItemReminders(id ?? null)
  const experiences = useExperiences(id ?? null)

  const [tab, setTab] = useState<Tab>('info')
  const [careAdvice, setCareAdvice] = useState<CareAdvice | null>(null)
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [showAddExperience, setShowAddExperience] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const item = items.find((i) => i.id === id)

  useEffect(() => {
    if (!id) return
    const unsub = onSnapshot(doc(db, 'careAdvice', id), (snap) => {
      if (snap.exists()) setCareAdvice(snap.data() as CareAdvice)
      else setCareAdvice(null)
    })
    return unsub
  }, [id])

  async function fetchAdvice() {
    if (!id) return
    setLoadingAdvice(true)
    try {
      const fn = httpsCallable<{ itemId: string }, { advice: string }>(functions, 'getItemAdvice')
      await fn({ itemId: id })
    } catch {
      // advice will update via onSnapshot when function completes
    } finally {
      setLoadingAdvice(false)
    }
  }

  async function handleCompleteReminder(reminderId: string) {
    const r = reminders.find((x) => x.id === reminderId)
    if (!r) return
    await completeReminder(r)
  }

  async function handleDeleteItem() {
    if (!id || !window.confirm('Slet dette objekt?')) return
    await deleteItem(id)
    navigate(-1)
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Ikke fundet
      </div>
    )
  }

  const isGarden = item.category === 'garden'
  const isGardenTask = isGarden && item.type === 'task'
  const accentBg = isGarden ? 'bg-garden-bg' : 'bg-house-bg'
  const accentText = isGarden ? 'text-garden-text' : 'text-house-text'
  const accentCta = isGarden ? 'bg-[#1D9E75]' : 'bg-[#378ADD]'

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-24">
      {/* Hero */}
      <div className={`relative ${accentBg} h-52 flex items-center justify-center`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <span className="text-8xl">
            {isGarden
              ? ({ tree: '🌳', shrub: '🌿', plant: '🌱', bulb: '🌷', other: '🌾', task: '⚒️' } as Record<string, string>)[item.type ?? 'other']
              : ({ woodwork: '🪵', windows: '🪟', terrace: '🏡', foundation: '🏗️', other: '🔧' } as Record<string, string>)[item.houseCategory ?? 'other']
            }
          </span>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow text-gray-700"
        >
          ←
        </button>
        <button
          onClick={() => setShowEdit(true)}
          className="absolute top-12 right-14 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow text-gray-500"
        >
          ✏️
        </button>
        <button
          onClick={handleDeleteItem}
          className="absolute top-12 right-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow text-gray-500"
        >
          🗑
        </button>
      </div>

      {/* Name + tabs */}
      <div className="bg-white px-5 pt-4 pb-0 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">{item.name}</h1>
        {item.variety && <p className="text-sm text-gray-500 mt-0.5">{item.variety}</p>}

        <div className="flex mt-4 border-b border-gray-100">
          {(['info', 'notes', 'reminders'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t ? `${accentText} border-current` : 'text-gray-400 border-transparent'
              }`}
            >
              {t === 'info' ? 'Info' : t === 'notes' ? 'Erfaringer' : 'Påmindelser'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* INFO TAB */}
        {tab === 'info' && (
          <div className="space-y-4">
            {/* Details */}
            <div className="bg-white rounded-2xl p-4 space-y-2">
              {isGarden && !isGardenTask && item.locationText && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Placering</p>
                  <p className="text-sm text-gray-900 mt-0.5">{item.locationText}</p>
                </div>
              )}
              {(!isGarden || isGardenTask) && item.description && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Beskrivelse</p>
                  <p className="text-sm text-gray-900 mt-0.5">{item.description}</p>
                </div>
              )}
              {(!isGarden || isGardenTask) && item.lastPerformed && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Sidst udført</p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {item.lastPerformed.toDate().toLocaleDateString('da-DK')}
                  </p>
                </div>
              )}
            </div>

            {/* Care advice */}
            <div className={`${accentBg} rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${accentText}`}>
                  {isGardenTask ? 'Vedligeholdelsesråd' : isGarden ? 'Plejeinformation' : 'Vedligeholdelsesråd'}
                </p>
                {careAdvice && (
                  <span className="text-xs text-gray-400">
                    {careAdvice.generatedAt.toDate().toLocaleDateString('da-DK')}
                    {careAdvice.isStale && ' · Forældet'}
                  </span>
                )}
              </div>
              {careAdvice ? (
                <p className={`text-sm ${accentText} leading-relaxed whitespace-pre-line`}>
                  {careAdvice.cachedAdvice}
                </p>
              ) : (
                <p className={`text-sm ${accentText}/70`}>Ingen rådgivning endnu.</p>
              )}
              <button
                onClick={fetchAdvice}
                disabled={loadingAdvice}
                className={`mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white ${accentCta} disabled:opacity-50`}
              >
                {loadingAdvice ? 'Henter…' : careAdvice ? 'Opdatér' : 'Hent rådgivning'}
              </button>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {tab === 'notes' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowAddExperience(true)}
              className={`w-full py-3 rounded-xl font-semibold text-white ${accentCta}`}
            >
              + Tilføj erfaring
            </button>
            {experiences.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">Ingen erfaringer endnu</div>
            )}
            {experiences.map((exp) => (
              <div key={exp.id} className="bg-white rounded-2xl p-4">
                {exp.imageUrl && (
                  <img src={exp.imageUrl} alt="" className="w-full rounded-xl object-cover mb-3 max-h-48" />
                )}
                <p className="text-sm text-gray-900 leading-relaxed">{exp.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    {exp.date.toDate().toLocaleDateString('da-DK')}
                  </p>
                  {exp.createdBy === user?.uid && (
                    <button
                      onClick={() => deleteExperience(exp.id)}
                      className="text-xs text-gray-300 hover:text-red-400"
                    >
                      Slet
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REMINDERS TAB */}
        {tab === 'reminders' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowAddReminder(true)}
              className={`w-full py-3 rounded-xl font-semibold text-white ${accentCta}`}
            >
              + Tilføj påmindelse
            </button>
            {reminders.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">Ingen påmindelser</div>
            )}
            {reminders.map((r) => {
              const status = getReminderStatus(r)
              return (
                <div key={r.id} className="bg-white rounded-2xl p-4 flex items-center gap-3">
                  <button
                    onClick={() => handleCompleteReminder(r.id)}
                    className={`w-7 h-7 rounded-full border-2 flex-shrink-0 transition-colors ${
                      r.completed ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-gray-300'
                    }`}
                  >
                    {r.completed && <span className="text-white text-xs block text-center">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${r.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.dueDate.toDate().toLocaleDateString('da-DK')}
                      {r.recurring !== 'none' && ` · ${({ weekly: 'Ugentlig', monthly: 'Månedlig', yearly: 'Årlig', none: '' } as Record<string, string>)[r.recurring]}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <button
                      onClick={() => deleteReminder(r.id)}
                      className="text-gray-300 hover:text-red-400 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showEdit && item && (
        <EditItemForm item={item} onClose={() => setShowEdit(false)} />
      )}
      {showAddReminder && id && (
        <AddReminderForm itemId={id} onClose={() => setShowAddReminder(false)} />
      )}
      {showAddExperience && id && (
        <AddExperienceForm itemId={id} onClose={() => setShowAddExperience(false)} />
      )}
    </div>
  )
}
