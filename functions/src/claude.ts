import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import Anthropic from '@anthropic-ai/sdk'

const anthropicKey = defineSecret('ANTHROPIC_API_KEY')

const GARDEN_TYPE_LABELS: Record<string, string> = {
  tree: 'Træ', shrub: 'Busk', plant: 'Plante', bulb: 'Løg', other: 'Andet',
}
const HOUSE_CAT_LABELS: Record<string, string> = {
  woodwork: 'Træværk', windows: 'Vinduer', terrace: 'Terrasse', foundation: 'Fundament', other: 'Andet',
}

// Static system prompt — cached across requests to reduce token cost
const SYSTEM_PROMPT = `Du er en ekspert have- og boligassistent der hjælper danske husejere.
Giv konkrete, praktiske råd baseret på de oplysninger der gives.
Svar altid på dansk. Hold svarene kortfattede men informative – max 300 ord.
Formatér med korte afsnit adskilt af tomme linjer. Ingen overskrifter eller bullet points.`

export const getItemAdvice = onCall(
  { secrets: [anthropicKey], region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Kræver login')
    }

    const { itemId } = request.data as { itemId?: string }
    if (!itemId) throw new HttpsError('invalid-argument', 'itemId mangler')

    const db = admin.firestore()

    const itemSnap = await db.collection('items').doc(itemId).get()
    if (!itemSnap.exists) throw new HttpsError('not-found', 'Item ikke fundet')
    const item = itemSnap.data()!

    // Recent experiences provide useful context for the advice
    const expSnap = await db.collection('experiences')
      .where('itemId', '==', itemId)
      .orderBy('date', 'desc')
      .limit(5)
      .get()
    const experiences = expSnap.docs.map((d) => d.data().text as string)

    const userPrompt = buildPrompt(item, experiences)

    const client = new Anthropic({ apiKey: anthropicKey.value() })
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const advice =
      response.content[0].type === 'text' ? response.content[0].text : ''

    await db.collection('careAdvice').doc(itemId).set({
      cachedAdvice: advice,
      generatedAt: admin.firestore.Timestamp.now(),
      isStale: false,
      itemName: item.name as string,
      variety: (item.variety as string | undefined) ?? null,
    })

    return { advice }
  },
)

function buildPrompt(item: admin.firestore.DocumentData, experiences: string[]): string {
  const expSection =
    experiences.length > 0
      ? `\nEgne erfaringer:\n${experiences.map((e) => `- ${e}`).join('\n')}`
      : ''

  if (item.category === 'garden' && item.type === 'task') {
    const lastPerformed =
      item.lastPerformed
        ? new Date((item.lastPerformed as admin.firestore.Timestamp).seconds * 1000)
            .toLocaleDateString('da-DK')
        : null

    return [
      `Haveopgave: ${item.name}`,
      item.description ? `Beskrivelse: ${item.description}` : null,
      lastPerformed ? `Sidst udført: ${lastPerformed}` : null,
      expSection || null,
      '\nGiv råd om denne haveopgave inkl. anbefalet frekvens, bedste tidspunkt på året og praktiske tips.',
    ]
      .filter(Boolean)
      .join('\n')
  }

  if (item.category === 'garden') {
    return [
      `Plante: ${item.name}${item.variety ? ` (${item.variety})` : ''}`,
      `Type: ${GARDEN_TYPE_LABELS[item.type as string] ?? item.type}`,
      item.locationText ? `Placering: ${item.locationText}` : null,
      expSection || null,
      '\nGiv plejeinformation inkl. vanding, gødning, beskæring og sæsonrytme.',
    ]
      .filter(Boolean)
      .join('\n')
  }

  const lastPerformed =
    item.lastPerformed
      ? new Date((item.lastPerformed as admin.firestore.Timestamp).seconds * 1000)
          .toLocaleDateString('da-DK')
      : null

  return [
    `Opgave: ${item.name}`,
    `Kategori: ${HOUSE_CAT_LABELS[item.houseCategory as string] ?? item.houseCategory}`,
    item.description ? `Beskrivelse: ${item.description}` : null,
    lastPerformed ? `Sidst udført: ${lastPerformed}` : null,
    expSection || null,
    '\nGiv vedligeholdelsesråd inkl. frekvens, årstid og advarselstegn.',
  ]
    .filter(Boolean)
    .join('\n')
}
