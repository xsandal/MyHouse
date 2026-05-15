import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGarden } from '../contexts/GardenContext'
import { useItems } from '../hooks/useItems'
import { useReminders } from '../hooks/useReminders'
import { CategoryToggle } from '../components/CategoryToggle'
import { StatusBadge } from '../components/StatusBadge'
import { AddItemForm } from '../components/forms/AddItemForm'
import type { GardenItemType, HouseCategory, Item, Reminder } from '../types'
import { getItemStatus } from '../types'

const GARDEN_TYPE_LABELS: Record<GardenItemType, string> = {
  tree: 'Træ', shrub: 'Busk', plant: 'Plante', bulb: 'Løg', other: 'Andet', task: 'Opgave',
}
const HOUSE_CAT_LABELS: Record<HouseCategory, string> = {
  woodwork: 'Træværk', windows: 'Vinduer', terrace: 'Terrasse', foundation: 'Fundament', other: 'Andet',
}
const GARDEN_EMOJIS: Record<GardenItemType, string> = {
  tree: '🌳', shrub: '🌿', plant: '🌱', bulb: '🌷', other: '🌾', task: '⚒️',
}
const HOUSE_EMOJIS: Record<HouseCategory, string> = {
  woodwork: '🪵', windows: '🪟', terrace: '🏡', foundation: '🏗️', other: '🔧',
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item)
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

export function Overview() {
  const navigate = useNavigate()
  const { gardenId, category } = useGarden()
  const { items } = useItems(gardenId)
  const { reminders } = useReminders(gardenId)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showAddItem, setShowAddItem] = useState(false)

  const itemRemindersMap = new Map<string, Reminder[]>()
  items.forEach((item) => {
    itemRemindersMap.set(item.id, reminders.filter((r) => r.itemId === item.id))
  })

  const filtered = items
    .filter((i) => i.category === category)
    .filter((i) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        i.name.toLowerCase().includes(q) ||
        (i.variety?.toLowerCase().includes(q) ?? false) ||
        (i.locationText?.toLowerCase().includes(q) ?? false)
      )
    })
    .filter((i) => {
      if (typeFilter === 'all') return true
      return category === 'garden' ? i.type === typeFilter : i.houseCategory === typeFilter
    })

  const grouped =
    category === 'garden'
      ? groupBy(filtered, (i) => i.type ?? 'other')
      : groupBy(filtered, (i) => i.houseCategory ?? 'other')

  const filterOptions =
    category === 'garden'
      ? Object.entries(GARDEN_TYPE_LABELS)
      : Object.entries(HOUSE_CAT_LABELS)

  function getRowEmoji(item: Item): string {
    if (item.category === 'garden') return GARDEN_EMOJIS[item.type ?? 'other'] ?? '🌿'
    return HOUSE_EMOJIS[item.houseCategory ?? 'other'] ?? '🔧'
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Oversigt</h1>
        <CategoryToggle />
        <div className="mt-3">
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] bg-gray-50"
            placeholder="Søg…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === 'all'
                ? category === 'garden' ? 'bg-garden-bg text-garden-text border-transparent' : 'bg-house-bg text-house-text border-transparent'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Alle
          </button>
          {filterOptions.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                typeFilter === key
                  ? category === 'garden' ? 'bg-garden-bg text-garden-text border-transparent' : 'bg-house-bg text-house-text border-transparent'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center text-gray-400 text-sm py-12">
            <div className="text-4xl mb-2">{category === 'garden' ? '🌱' : '🔧'}</div>
            Ingen resultater
          </div>
        )}
        {Object.entries(grouped).map(([groupKey, groupItems]) => {
          const label = category === 'garden'
            ? GARDEN_TYPE_LABELS[groupKey as GardenItemType]
            : HOUSE_CAT_LABELS[groupKey as HouseCategory]
          return (
            <section key={groupKey}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</h3>
              <div className="bg-white rounded-2xl divide-y divide-gray-50 shadow-sm">
                {groupItems.map((item) => {
                  const status = getItemStatus(itemRemindersMap.get(item.id) ?? [])
                  const subtitle = [item.variety, item.locationText].filter(Boolean).join(' · ')
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/items/${item.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                        category === 'garden' ? 'bg-garden-bg' : 'bg-house-bg'
                      }`}>
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                          : getRowEmoji(item)
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
                      </div>
                      <StatusBadge status={status} />
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddItem(true)}
        className={`fixed bottom-24 right-5 w-14 h-14 rounded-full shadow-lg text-white text-2xl flex items-center justify-center z-30 ${
          category === 'garden' ? 'bg-[#1D9E75]' : 'bg-[#378ADD]'
        }`}
      >
        +
      </button>

      {showAddItem && <AddItemForm onClose={() => setShowAddItem(false)} />}
    </div>
  )
}
