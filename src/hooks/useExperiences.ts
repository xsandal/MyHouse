import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import type { Experience } from '../types'

export function useExperiences(itemId: string | null) {
  const [experiences, setExperiences] = useState<Experience[]>([])

  useEffect(() => {
    if (!itemId) {
      setExperiences([])
      return
    }

    const q = query(
      collection(db, 'experiences'),
      where('itemId', '==', itemId),
      orderBy('date', 'desc'),
    )

    const unsub = onSnapshot(q, (snap) => {
      setExperiences(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Experience))
    })

    return unsub
  }, [itemId])

  return experiences
}
