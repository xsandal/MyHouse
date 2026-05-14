import { useState } from 'react'
import type { Category, GardenItemType, HouseCategory } from '../../types'
import { addItem } from '../../services/firestore'
import { uploadImage } from '../../services/storage'
import { useAuth } from '../../contexts/AuthContext'
import { useGarden } from '../../contexts/GardenContext'

interface Props {
  onClose: () => void
}

export function AddItemForm({ onClose }: Props) {
  const { user } = useAuth()
  const { gardenId, category } = useGarden()

  const [name, setName] = useState('')
  const [isGardenTask, setIsGardenTask] = useState(false)
  const [type, setType] = useState<GardenItemType>('plant')
  const [variety, setVariety] = useState('')
  const [locationText, setLocationText] = useState('')
  const [houseCategory, setHouseCategory] = useState<HouseCategory>('other')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  function toggleGardenMode(toTask: boolean) {
    setIsGardenTask(toTask)
    setType(toTask ? 'task' : 'plant')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !gardenId || !name.trim()) return
    setSaving(true)
    try {
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadImage(
          `items/${gardenId}/${Date.now()}_main`,
          imageFile,
        )
      }

      const base = {
        gardenId,
        category: category as Category,
        name: name.trim(),
        imageUrl,
        addedBy: user.uid,
      }

      if (category === 'garden') {
        if (isGardenTask) {
          await addItem({
            ...base,
            type: 'task',
            ...(description.trim() ? { description: description.trim() } : {}),
            lastPerformed: null,
            locationImageUrl: null,
          })
        } else {
          await addItem({
            ...base,
            type,
            ...(variety.trim() ? { variety: variety.trim() } : {}),
            ...(locationText.trim() ? { locationText: locationText.trim() } : {}),
            locationImageUrl: null,
          })
        }
      } else {
        await addItem({
          ...base,
          houseCategory,
          ...(description.trim() ? { description: description.trim() } : {}),
          lastPerformed: null,
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          {category === 'garden' ? (isGardenTask ? 'Tilføj haveopgave' : 'Tilføj plante') : 'Tilføj husopgave'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {category === 'garden' && (
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGardenMode(false)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  !isGardenTask ? 'bg-garden-bg text-garden-text' : 'bg-white text-gray-400'
                }`}
              >
                Plante
              </button>
              <button
                type="button"
                onClick={() => toggleGardenMode(true)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  isGardenTask ? 'bg-garden-bg text-garden-text' : 'bg-white text-gray-400'
                }`}
              >
                Opgave
              </button>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {category === 'garden' && !isGardenTask ? 'Navn *' : 'Titel *'}
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                category === 'garden'
                  ? isGardenTask ? 'f.eks. Luge ukrudt' : 'f.eks. Æbletræ'
                  : 'f.eks. Male vindueskarme'
              }
              required
            />
          </div>

          {category === 'garden' && !isGardenTask ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['tree', 'shrub', 'plant', 'bulb', 'other'] as GardenItemType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        type === t
                          ? 'bg-garden-bg text-garden-text border-transparent'
                          : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {({ tree: 'Træ', shrub: 'Busk', plant: 'Plante', bulb: 'Løg', other: 'Andet' } as Record<string, string>)[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Sort</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75]"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="f.eks. Cox Orange"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Placering</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75]"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="f.eks. Bag hækken mod syd"
                />
              </div>
            </>
          ) : category === 'garden' && isGardenTask ? (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Beskrivelse</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Valgfri beskrivelse..."
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {(['woodwork', 'windows', 'terrace', 'foundation', 'other'] as HouseCategory[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setHouseCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        houseCategory === c
                          ? 'bg-house-bg text-house-text border-transparent'
                          : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {({ woodwork: 'Træværk', windows: 'Vinduer', terrace: 'Terrasse', foundation: 'Fundament', other: 'Andet' } as Record<string, string>)[c]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Beskrivelse</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#378ADD] resize-none"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Valgfri beskrivelse..."
                />
              </div>
            </>
          )}

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
            disabled={saving || !name.trim()}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-opacity ${
              category === 'garden' ? 'bg-[#1D9E75]' : 'bg-[#378ADD]'
            } disabled:opacity-50`}
          >
            {saving ? 'Gemmer…' : 'Gem'}
          </button>
        </form>
      </div>
    </div>
  )
}
