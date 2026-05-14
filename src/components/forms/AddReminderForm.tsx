import { useState } from 'react'
import type { RecurringType } from '../../types'
import { addReminder } from '../../services/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useGarden } from '../../contexts/GardenContext'
import { Timestamp } from 'firebase/firestore'

interface Props {
  itemId: string
  onClose: () => void
}

const recurringLabels: Record<RecurringType, string> = {
  none: 'Ingen',
  weekly: 'Ugentlig',
  monthly: 'Månedlig',
  yearly: 'Årlig',
}

export function AddReminderForm({ itemId, onClose }: Props) {
  const { user } = useAuth()
  const { gardenId, garden } = useGarden()

  const today = new Date().toISOString().split('T')[0]
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(today)
  const [recurring, setRecurring] = useState<RecurringType>('none')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !gardenId || !title.trim() || !dueDate) return
    setSaving(true)
    try {
      await addReminder({
        itemId,
        gardenId,
        title: title.trim(),
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        recurring,
        createdBy: user.uid,
        notifyUsers: garden?.members ?? [user.uid],
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-gray-900 mb-5">Tilføj påmindelse</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Titel *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="f.eks. Gød rosenbuske"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Dato *</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Gentagelse</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(recurringLabels) as RecurringType[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecurring(r)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    recurring === r
                      ? 'bg-garden-bg text-garden-text border-transparent'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {recurringLabels[r]}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#1D9E75] disabled:opacity-50"
          >
            {saving ? 'Gemmer…' : 'Gem'}
          </button>
        </form>
      </div>
    </div>
  )
}
