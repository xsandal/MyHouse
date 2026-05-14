import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import type { Item } from '../types'

export function useItems(gardenId: string | null) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gardenId) {
      setItems([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'items'),
      where('gardenId', '==', gardenId),
      orderBy('addedAt', 'desc'),
    )

    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Item))
      setLoading(false)
    })

    return unsub
  }, [gardenId])

  return { items, loading }
}
