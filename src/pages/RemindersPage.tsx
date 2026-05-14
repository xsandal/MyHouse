import { useNavigate } from 'react-router-dom'
import { useGarden } from '../contexts/GardenContext'
import { useItems } from '../hooks/useItems'
import { useReminders } from '../hooks/useReminders'
import { StatusBadge } from '../components/StatusBadge'
import { completeReminder } from '../services/firestore'
import type { Reminder } from '../types'
import { getReminderStatus } from '../types'

function formatDate(r: Reminder): string {
  return r.dueDate.toDate().toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function RemindersPage() {
  const navigate = useNavigate()
  const { gardenId } = useGarden()
  const { items } = useItems(gardenId)
  const { reminders } = useReminders(gardenId)

  const overdue = reminders.filter((r) => getReminderStatus(r) === 'overdue')
  const soon = reminders.filter((r) => getReminderStatus(r) === 'soon')
  const ok = reminders.filter((r) => getReminderStatus(r) === 'ok')

  function getItemName(itemId: string): string {
    return items.find((i) => i.id === itemId)?.name ?? '–'
  }

  function ReminderRow({ r }: { r: Reminder }) {
    const item = items.find((i) => i.id === r.itemId)
    return (
      <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
        <button
          onClick={() => completeReminder(r)}
          className="w-7 h-7 rounded-full border-2 border-gray-300 flex-shrink-0"
        />
        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => item && navigate(`/items/${item.id}`)}
        >
          <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{getItemName(r.itemId)} · {formatDate(r)}</p>
        </button>
        <StatusBadge status={getReminderStatus(r)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-24">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Påmindelser</h1>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {overdue.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-[#791F1F] uppercase tracking-wide mb-2">Forfaldne</h3>
            <div className="space-y-2">
              {overdue.map((r) => <ReminderRow key={r.id} r={r} />)}
            </div>
          </section>
        )}
        {soon.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-[#633806] uppercase tracking-wide mb-2">Inden for 2 uger</h3>
            <div className="space-y-2">
              {soon.map((r) => <ReminderRow key={r.id} r={r} />)}
            </div>
          </section>
        )}
        {ok.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-[#27500A] uppercase tracking-wide mb-2">Kommende</h3>
            <div className="space-y-2">
              {ok.map((r) => <ReminderRow key={r.id} r={r} />)}
            </div>
          </section>
        )}
        {reminders.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-16">
            <div className="text-4xl mb-2">🔔</div>
            Ingen påmindelser
          </div>
        )}
      </div>
    </div>
  )
}
