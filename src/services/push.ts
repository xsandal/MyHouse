import { isSupported, getMessaging, getToken } from 'firebase/messaging'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { app, db } from './firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export async function requestPushPermission(userId: string): Promise<boolean> {
  try {
    if (!(await isSupported())) return false
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token) {
      await updateDoc(doc(db, 'users', userId), { fcmTokens: arrayUnion(token) })
    }
    return true
  } catch {
    return false
  }
}

export async function hasPushPermission(): Promise<boolean> {
  return 'Notification' in window && Notification.permission === 'granted'
}
