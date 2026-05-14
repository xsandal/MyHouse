import type { ReminderStatus } from '../types'

const config: Record<ReminderStatus, { label: string; bg: string; text: string }> = {
  ok: { label: 'OK', bg: 'bg-[#EAF3DE]', text: 'text-[#27500A]' },
  soon: { label: 'Snart', bg: 'bg-[#FAEEDA]', text: 'text-[#633806]' },
  overdue: { label: 'Forfalden', bg: 'bg-[#FCEBEB]', text: 'text-[#791F1F]' },
}

export function StatusBadge({ status }: { status: ReminderStatus }) {
  const { label, bg, text } = config[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}
