import * as admin from 'firebase-admin'
import { onSchedule } from 'firebase-functions/v2/scheduler'

export const markStaleAdvice = onSchedule(
  { schedule: '0 4 * * *', timeZone: 'Europe/Copenhagen', region: 'europe-west1' },
  async () => {
    const db = admin.firestore()

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const snap = await db
      .collection('careAdvice')
      .where('isStale', '==', false)
      .where('generatedAt', '<', admin.firestore.Timestamp.fromDate(ninetyDaysAgo))
      .get()

    if (snap.empty) return

    const batch = db.batch()
    snap.docs.forEach((doc) => batch.update(doc.ref, { isStale: true }))
    await batch.commit()
  },
)
