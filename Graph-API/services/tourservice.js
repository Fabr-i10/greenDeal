import { connection } from "./connection.js"
import { genId } from "../utils/idgen.js"
import { getProvider } from "./providerservice.js"

const tourtb = () => connection.table("tours")

export async function getTour(id, userId) {
    return await tourtb().first().where({ id, userId })
}

export async function getTours(userId) {
    return await tourtb().select().where({ userId }).orderBy("tourName", "asc")
}

async function validateProvider(providerId, userId) {
    const provider = await getProvider(providerId, userId)
    if (!provider) {
        throw new Error("PROVIDER_NOT_FOUND")
    }
    return provider
}

export async function createTour({
    userId,
    tourName,
    description,
    location,
    pricePerPerson,
    providerId,
}) {
    await validateProvider(providerId, userId)

    const tour = {
        id: genId(),
        userId,
        providerId,
        tourName,
        description,
        location,
        pricePerPerson,
        createdAt: new Date().toISOString(),
    }

    await tourtb().insert(tour)
    return tour
}

export async function updateTour(id, userId, data) {
    const existing = await getTour(id, userId)
    if (!existing) return null

    await validateProvider(data.providerId, userId)
    await tourtb().where({ id, userId }).update(data)
    return await getTour(id, userId)
}

export async function deleteTour(id, userId) {
    const existing = await getTour(id, userId)
    if (!existing) return false

    await tourtb().where({ id, userId }).delete()
    return true
}
