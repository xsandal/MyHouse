import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from './AuthContext'
import type { Category, Garden } from '../types'

interface GardenContextValue {
  garden: Garden | null
  gardenId: string | null
  category: Category
  setCategory: (c: Category) => void
  loading: boolean
}

const GardenContext = createContext<GardenContextValue>({
  garden: null,
  gardenId: null,
  category: 'garden',
  setCategory: () => {},
  loading: true,
})

export function GardenProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [gardenId, setGardenId] = useState<string | null>(null)
  const [category, setCategory] = useState<Category>('garden')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setGarden(null)
      setGardenId(null)
      setLoading(false)
      return
    }

    // Lyt på brugerprofil for at finde gardenId
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const ids: string[] = snap.data()?.gardenIds ?? []
      setGardenId(ids[0] ?? null)
      setLoading(false)
    })

    return unsub
  }, [user])

  useEffect(() => {
    if (!gardenId) {
      setGarden(null)
      return
    }
    const unsub = onSnapshot(doc(db, 'gardens', gardenId), (snap) => {
      if (snap.exists()) setGarden({ id: snap.id, ...snap.data() } as Garden)
    })
    return unsub
  }, [gardenId])

  return (
    <GardenContext.Provider value={{ garden, gardenId, category, setCategory, loading }}>
      {children}
    </GardenContext.Provider>
  )
}

export function useGarden() {
  return useContext(GardenContext)
}
