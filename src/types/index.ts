import type { Timestamp } from 'firebase/firestore'

export type Category = 'garden' | 'house'

export type GardenItemType = 'tree' | 'shrub' | 'plant' | 'bulb' | 'other'
export type HouseCategory = 'woodwork' | 'windows' | 'terrace' | 'foundation' | 'other'
export type RecurringType = 'none' | 'weekly' | 'monthly' | 'yearly'

export interface UserProfile {
  id: string
  email: string
  displayName: string
  photoURL: string | null
  gardenIds: string[]
  fcmTokens: string[]
  createdAt: Timestamp
}

export interface Garden {
  id: string
  name: string
  members: string[]
  inviteCode: string
  createdAt: Timestamp
}

export interface Item {
  id: string
  gardenId: string
  category: Category
  name: string
  imageUrl: string | null
  addedBy: string
  addedAt: Timestamp
  // have-specifikke felter
  type?: GardenItemType
  variety?: string
  locationText?: string
  locationImageUrl?: string | null
  // hus-specifikke felter
  houseCategory?: HouseCategory
  description?: string
  lastPerformed?: Timestamp | null
}

export interface Reminder {
  id: string
  itemId: string
  gardenId: string
  title: string
  dueDate: Timestamp
  recurring: RecurringType
  completed: boolean
  completedAt: Timestamp | null
  createdBy: string
  notifyUsers: string[]
}

export interface Experience {
  id: string
  itemId: string
  gardenId: string
  text: string
  imageUrl: string | null
  date: Timestamp
  createdBy: string
}

export interface CareAdvice {
  cachedAdvice: string
  generatedAt: Timestamp
  isStale: boolean
  itemName: string
  variety: string | null
}

export type ReminderStatus = 'ok' | 'soon' | 'overdue'

export function getReminderStatus(reminder: Reminder): ReminderStatus {
  if (reminder.completed) return 'ok'
  const now = Date.now()
  const due = reminder.dueDate.toMillis()
  const twoWeeks = 14 * 24 * 60 * 60 * 1000
  if (due < now) return 'overdue'
  if (due - now < twoWeeks) return 'soon'
  return 'ok'
}

export function getItemStatus(reminders: Reminder[]): ReminderStatus {
  const active = reminders.filter((r) => !r.completed)
  if (active.some((r) => getReminderStatus(r) === 'overdue')) return 'overdue'
  if (active.some((r) => getReminderStatus(r) === 'soon')) return 'soon'
  return 'ok'
}

export function nextRecurringDate(dueDate: Date, recurring: RecurringType): Date {
  const next = new Date(dueDate)
  switch (recurring) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  return next
}
