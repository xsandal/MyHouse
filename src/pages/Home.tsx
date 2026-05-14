import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGarden } from '../contexts/GardenContext'
import { useItems } from '../hooks/useItems'
import { useReminders } from '../hooks/useReminders'
import { CategoryToggle } from '../components/CategoryToggle'
import { ItemCard } from '../components/ItemCard'
import { StatusBadge } from '../components/StatusBadge'
import { AddItemForm } from '../components/forms/AddItemForm'
import type { Reminder } from '../types'
import { getReminderStatus } from '../types'

function formatDate(reminder: Reminder): string {
  const date = reminder.dueDate.toDate()
  return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

export function Home() {
  const navigate = useNavigate()
  const { garden, gardenId, category } = useGarden()
  const { items } = useItems(gardenId)
  const { reminders } = useReminders(gardenId)
  const [showAddItem, setShowAddItem] = useState(false)

  const filtered = items.filter((i) => i.category === category)
  const previewItems = filtered.slice(0, 6)
  const upcomingReminders = reminders
    .filter((r) => !r.completed)
    .slice(0, 3)

  const itemRemindersMap = new Map<string, Reminder[]>()
  items.forEach((item) => {
    itemRemindersMap.set(
      item.id,
      reminders.filter((r) => r.itemId === item.id),
    )
  })

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{garden?.name ?? 'Vores have'}</h1>
            <p className="text-sm text-gray-500">{filtered.length} {category === 'garden' ? 'planter' : 'opgaver'}</p>
          </div>
        </div>
        <CategoryToggle />
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* Item grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">
              {category === 'garden' ? 'Planter' : 'Husopgaver'}
            </h2>
            {filtered.length > 6 && (
              <button
                onClick={() => navigate('/overview')}
                className="text-sm text-[#1D9E75] font-medium"
              >
                Se alle
              </button>
            )}
          </div>
          {previewItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
              <div className="text-4xl mb-2">{category === 'garden' ? '🌱' : '🔧'}</div>
              Ingen {category === 'garden' ? 'planter' : 'opgaver'} endnu
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {previewItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  reminders={itemRemindersMap.get(item.id) ?? []}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming reminders */}
        {upcomingReminders.length > 0 && (
          <section>
            <h2 className="font-semibold text-gray-800 mb-3">Kommende påmindelser</h2>
            <div className="bg-white rounded-2xl divide-y divide-gray-50">
              {upcomingReminders.map((r) => {
                const item = items.find((i) => i.id === r.itemId)
                return (
                  <button
                    key={r.id}
                    onClick={() => item && navigate(`/items/${item.id}`)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.title}</p>
                      {item && <p className="text-xs text-gray-400 mt-0.5">{item.name}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-xs text-gray-400">{formatDate(r)}</span>
                      <StatusBadge status={getReminderStatus(r)} />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}
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
