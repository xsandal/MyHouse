import { useState } from 'react'
import type { Item, GardenItemType, HouseCategory } from '../../types'
import { updateItem, invalidateCareAdvice } from '../../services/firestore'
import { uploadImage } from '../../services/storage'

interface Props {
  item: Item
  onClose: () => void
}

export function EditItemForm({ item, onClose }: Props) {
  const isGarden = item.category === 'garden'
  const isGardenTask = isGarden && item.type === 'task'
  const accentFocus = isGarden ? 'focus:border-[#1D9E75]' : 'focus:border-[#378ADD]'
  const accentActive = isGarden ? 'bg-garden-bg text-garden-text' : 'bg-house-bg text-house-text'
  const accentCta = isGarden ? 'bg-[#1D9E75]' : 'bg-[#378ADD]'

  const [name, setName] = useState(item.name)
  const [type, setType] = useState<GardenItemType>(item.type ?? 'plant')
  const [variety, setVariety] = useState(item.variety ?? '')
  const [locationText, setLocationText] = useState(item.locationText ?? '')
  const [houseCategory, setHouseCategory] = useState<HouseCategory>(item.houseCategory ?? 'other')
  const [description, setDescription] = useState(item.description ?? '')
  const [lastPerformedStr, setLastPerformedStr] = useState(
    item.lastPerformed ? item.lastPerformed.toDate().toISOString().slice(0, 10) : '',
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const nameChanged = name.trim() !== item.name
      const varietyChanged = variety.trim() !== (item.variety ?? '')

      let imageUrl = item.imageUrl
      if (imageFile) {
        imageUrl = await uploadImage(
          `items/${item.gardenId}/${Date.now()}_main`,
          imageFile,
        )
      }

      if (isGardenTask) {
        await updateItem(item.id, {
          name: name.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          imageUrl,
          lastPerformed: lastPerformedStr
            ? (await import('firebase/firestore')).Timestamp.fromDate(new Date(lastPerformedStr))
            : item.lastPerformed,
        })
      } else if (isGarden) {
        await updateItem(item.id, {
          name: name.trim(),
          type,
          ...(variety.trim() ? { variety: variety.trim() } : {}),
          ...(locationText.trim() ? { locationText: locationText.trim() } : {}),
          imageUrl,
        })
      } else {
        await updateItem(item.id, {
          name: name.trim(),
          houseCategory,
          ...(description.trim() ? { description: description.trim() } : {}),
          imageUrl,
          lastPerformed: lastPerformedStr
            ? (await import('firebase/firestore')).Timestamp.fromDate(new Date(lastPerformedStr))
            : item.lastPerformed,
        })
      }

      if (nameChanged || varietyChanged) {
        await invalidateCareAdvice(item.id)
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
        <h2 className="text-lg font-bold text-gray-900 mb-5">Redigér</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {isGarden ? 'Navn *' : 'Titel *'}
            </label>
            <input
              className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none ${accentFocus}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {isGardenTask ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Beskrivelse</label>
                <textarea
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none ${accentFocus} resize-none`}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Valgfri beskrivelse..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Sidst udført</label>
                <input
                  type="date"
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none ${accentFocus}`}
                  value={lastPerformedStr}
                  onChange={(e) => setLastPerformedStr(e.target.value)}
                />
              </div>
            </>
          ) : isGarden ? (
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
                        type === t ? accentActive + ' border-transparent' : 'bg-white text-gray-500 border-gray-200'
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
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none ${accentFocus}`}
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="f.eks. Cox Orange"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Placering</label>
                <input
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none ${accentFocus}`}
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="f.eks. Bag hækken mod syd"
                />
              </div>
            </>
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
                        houseCategory === c ? accentActive + ' border-transparent' : 'bg-white text-gray-500 border-gray-200'
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
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none ${accentFocus} resize-none`}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Valgfri beskrivelse..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Sidst udført</label>
                <input
                  type="date"
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none ${accentFocus}`}
                  value={lastPerformedStr}
                  onChange={(e) => setLastPerformedStr(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {item.imageUrl ? 'Erstat billede' : 'Billede'}
            </label>
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
            className={`w-full py-3 rounded-xl font-semibold text-white transition-opacity ${accentCta} disabled:opacity-50`}
          >
            {saving ? 'Gemmer…' : 'Gem ændringer'}
          </button>
        </form>
      </div>
    </div>
  )
}
