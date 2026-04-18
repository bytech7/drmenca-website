import type { Config, Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

const ALLOWED_SERVICES = new Set([
  'Alignement Dentaire',
  'Détartrage',
  'Blanchiment',
  'Implants',
  'Couronnes',
  'Pédiatrique',
  'Consultation',
  'Orthodontie',
  'Urgence',
])

const MAX_REVIEWS = 500

type Review = {
  id: string
  name: string
  service: string
  rating: number
  comment: string
  createdAt: string
}

const store = () => getStore({ name: 'reviews', consistency: 'strong' })

async function readAll(): Promise<Review[]> {
  const data = (await store().get('all', { type: 'json' })) as Review[] | null
  return Array.isArray(data) ? data : []
}

function clean(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max)
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'GET') {
    const reviews = await readAll()
    return Response.json(
      { reviews },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return new Response('Corps de requête invalide.', { status: 400 })
    }

    const name = clean(body.name, 60)
    const service = clean(body.service, 40)
    const comment = clean(body.comment, 500)
    const rating = Math.floor(Number(body.rating))

    if (!name || !service || !comment) {
      return new Response('Tous les champs sont obligatoires.', { status: 400 })
    }
    if (!ALLOWED_SERVICES.has(service)) {
      return new Response('Service invalide.', { status: 400 })
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return new Response('Note invalide (1 à 5).', { status: 400 })
    }
    if (comment.length < 5) {
      return new Response('Votre avis est trop court.', { status: 400 })
    }

    const review: Review = {
      id: crypto.randomUUID(),
      name,
      service,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    }

    const existing = await readAll()
    existing.unshift(review)
    if (existing.length > MAX_REVIEWS) existing.length = MAX_REVIEWS
    await store().setJSON('all', existing)

    return Response.json({ review })
  }

  return new Response('Méthode non autorisée.', {
    status: 405,
    headers: { Allow: 'GET, POST' },
  })
}

export const config: Config = {
  path: '/api/reviews',
}
