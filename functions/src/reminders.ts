import * as admin from 'firebase-admin'
import { onSchedule } from 'firebase-functions/v2/scheduler'

export const sendDailyReminders = onSchedule(
  { schedule: '0 8 * * *', timeZone: 'Europe/Copenhagen', region: 'europe-west1' },
  async () => {
    const db = admin.firestore()
    const messaging = admin.messaging()

    // Midnight today in the function's timezone context
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const snap = await db
      .collection('reminders')
      .where('completed', '==', false)
      .where('dueDate', '>=', admin.firestore.Timestamp.fromDate(todayStart))
      .where('dueDate', '<', admin.firestore.Timestamp.fromDate(todayEnd))
      .get()

    if (snap.empty) return

    const reminders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
      id: string
      itemId: string
      title: string
      notifyUsers: string[]
    }>

    // Batch-fetch items so we have their names for notification text
    const itemIds = [...new Set(reminders.map((r) => r.itemId))]
    const itemSnaps = await Promise.all(
      itemIds.map((id) => db.collection('items').doc(id).get()),
    )
    const itemNameMap = new Map(
      itemSnaps.filter((s) => s.exists).map((s) => [s.id, (s.data()!.name as string)]),
    )

    // Group reminder titles by recipient user
    const userTitlesMap = new Map<string, string[]>()
    for (const r of reminders) {
      for (const uid of r.notifyUsers ?? []) {
        if (!userTitlesMap.has(uid)) userTitlesMap.set(uid, [])
        const label = `${r.title} (${itemNameMap.get(r.itemId) ?? r.title})`
        userTitlesMap.get(uid)!.push(label)
      }
    }

    await Promise.all(
      Array.from(userTitlesMap.entries()).map(async ([uid, titles]) => {
        const userSnap = await db.collection('users').doc(uid).get()
        const tokens = (userSnap.data()?.fcmTokens as string[] | undefined) ?? []
        if (tokens.length === 0) return

        const body =
          titles.length === 1
            ? titles[0]
            : `${titles.length} opgaver: ${titles.slice(0, 2).join(', ')}${titles.length > 2 ? '…' : ''}`

        const result = await messaging.sendEachForMulticast({
          tokens,
          notification: { title: 'MyHouse 🌿', body },
          webpush: {
            notification: { icon: '/pwa-192x192.png', badge: '/pwa-192x192.png' },
            fcmOptions: { link: '/' },
          },
        })

        // Clean up tokens that are no longer registered
        const staleTokens = result.responses
          .map((r, i) => (r.success ? null : tokens[i]))
          .filter((t): t is string => t !== null)

        if (staleTokens.length > 0) {
          await db.collection('users').doc(uid).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...staleTokens),
          })
        }
      }),
    )
  },
)
