import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider)
  const user = result.user

  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      gardenIds: [],
      fcmTokens: [],
      createdAt: serverTimestamp(),
    })
  }

  return user
}

export function signOutUser() {
  return signOut(auth)
}
