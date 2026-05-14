import { useNavigate } from 'react-router-dom'
import type { Item, Reminder } from '../types'
import { getItemStatus } from '../types'
import { StatusBadge } from './StatusBadge'

const GARDEN_EMOJIS: Record<string, string> = {
  tree: '🌳', shrub: '🌿', plant: '🌱', bulb: '🌷', other: '🌾', task: '⚒️',
}
const HOUSE_EMOJIS: Record<string, string> = {
  woodwork: '🪵', windows: '🪟', terrace: '🏡', foundation: '🏗️', other: '🔧',
}

function getEmoji(item: Item): string {
  if (item.category === 'garden') return GARDEN_EMOJIS[item.type ?? 'other'] ?? '🌿'
  return HOUSE_EMOJIS[item.houseCategory ?? 'other'] ?? '🔧'
}

interface Props {
  item: Item
  reminders: Reminder[]
}

export function ItemCard({ item, reminders }: Props) {
  const navigate = useNavigate()
  const status = getItemStatus(reminders)
  const subtitle = item.variety ?? item.locationText ?? ''

  return (
    <button
      onClick={() => navigate(`/items/${item.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left w-full active:scale-95 transition-transform"
    >
      <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{getEmoji(item)}</span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
        {subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>}
        <div className="mt-2">
          <StatusBadge status={status} />
        </div>
      </div>
    </button>
  )
}
