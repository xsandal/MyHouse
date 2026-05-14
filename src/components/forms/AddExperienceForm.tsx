import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { addExperience } from '../../services/firestore'
import { uploadImage } from '../../services/storage'
import { useAuth } from '../../contexts/AuthContext'
import { useGarden } from '../../contexts/GardenContext'

interface Props {
  itemId: string
  onClose: () => void
}

export function AddExperienceForm({ itemId, onClose }: Props) {
  const { user } = useAuth()
  const { gardenId } = useGarden()

  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !gardenId || !text.trim()) return
    setSaving(true)
    try {
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadImage(`experiences/${gardenId}/${Date.now()}`, imageFile)
      }
      await addExperience({
        itemId,
        gardenId,
        text: text.trim(),
        imageUrl,
        date: Timestamp.now(),
        createdBy: user.uid,
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
        <h2 className="text-lg font-bold text-gray-900 mb-5">Tilføj erfaring</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tekst *</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] resize-none"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="f.eks. Beskåret hårdt – kom sig fint"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Billede</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#1D9E75] disabled:opacity-50"
          >
            {saving ? 'Gemmer…' : 'Gem'}
          </button>
        </form>
      </div>
    </div>
  )
}
