import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Garden, Item, Reminder, Experience, RecurringType } from '../types'
import { nextRecurringDate } from '../types'

// --- Gardens ---

export async function createGarden(userId: string, name: string): Promise<string> {
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase()
  const ref = await addDoc(collection(db, 'gardens'), {
    name,
    members: [userId],
    inviteCode,
    createdAt: serverTimestamp(),
  })
  await setDoc(doc(db, 'users', userId), { gardenIds: [ref.id] }, { merge: true })
  return ref.id
}

export async function joinGardenByCode(userId: string, code: string): Promise<string | null> {
  const q = query(collection(db, 'gardens'), where('inviteCode', '==', code.toUpperCase()))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const gardenDoc = snap.docs[0]
  const members: string[] = gardenDoc.data().members
  if (!members.includes(userId)) {
    await updateDoc(gardenDoc.ref, { members: [...members, userId] })
    const userSnap = await getDoc(doc(db, 'users', userId))
    const gardenIds: string[] = userSnap.data()?.gardenIds ?? []
    await updateDoc(doc(db, 'users', userId), { gardenIds: [...gardenIds, gardenDoc.id] })
  }
  return gardenDoc.id
}

export async function getGarden(gardenId: string): Promise<Garden | null> {
  const snap = await getDoc(doc(db, 'gardens', gardenId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Garden
}

// --- Items ---

export async function addItem(data: Omit<Item, 'id' | 'addedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'items'), {
    ...data,
    addedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateItem(itemId: string, data: Partial<Item>): Promise<void> {
  await updateDoc(doc(db, 'items', itemId), data)
}

export async function deleteItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'items', itemId))
}

// --- Reminders ---

export async function addReminder(data: Omit<Reminder, 'id' | 'completed' | 'completedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'reminders'), {
    ...data,
    completed: false,
    completedAt: null,
  })
  return ref.id
}

export async function completeReminder(reminder: Reminder): Promise<void> {
  const batch = writeBatch(db)

  batch.update(doc(db, 'reminders', reminder.id), {
    completed: true,
    completedAt: serverTimestamp(),
  })

  if (reminder.recurring !== 'none') {
    const nextDate = nextRecurringDate(reminder.dueDate.toDate(), reminder.recurring as RecurringType)
    const newRef = doc(collection(db, 'reminders'))
    batch.set(newRef, {
      itemId: reminder.itemId,
      gardenId: reminder.gardenId,
      title: reminder.title,
      dueDate: Timestamp.fromDate(nextDate),
      recurring: reminder.recurring,
      completed: false,
      completedAt: null,
      createdBy: reminder.createdBy,
      notifyUsers: reminder.notifyUsers,
    })
  }

  await batch.commit()
}

export async function deleteReminder(reminderId: string): Promise<void> {
  await deleteDoc(doc(db, 'reminders', reminderId))
}

// --- Experiences ---

export async function addExperience(data: Omit<Experience, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'experiences'), data)
  return ref.id
}

export async function deleteExperience(experienceId: string): Promise<void> {
  await deleteDoc(doc(db, 'experiences', experienceId))
}

// --- CareAdvice cache-invalidering ---

export async function invalidateCareAdvice(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'careAdvice', itemId))
}
