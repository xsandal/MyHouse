import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import type { Reminder } from '../types'

export function useReminders(gardenId: string | null) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gardenId) {
      setReminders([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'reminders'),
      where('gardenId', '==', gardenId),
      where('completed', '==', false),
      orderBy('dueDate', 'asc'),
    )

    const unsub = onSnapshot(q, (snap) => {
      setReminders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reminder)
      )
      setLoading(false)
    })

    return unsub
  }, [gardenId])

  return { reminders, loading }
}

export function useItemReminders(itemId: string | null) {
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    if (!itemId) {
      setReminders([])
      return
    }

    const q = query(
      collection(db, 'reminders'),
      where('itemId', '==', itemId),
      orderBy('dueDate', 'asc'),
    )

    const unsub = onSnapshot(q, (snap) => {
      setReminders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reminder))
    })

    return unsub
  }, [itemId])

  return reminders
}
