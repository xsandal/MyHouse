import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadImage(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path)
  const snap = await uploadBytes(storageRef, file)
  return getDownloadURL(snap.ref)
}
