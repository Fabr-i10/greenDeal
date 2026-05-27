import { connection } from "./connection.js"
import { genId } from "../utils/idgen.js"

const providertb = () => connection.table("providers")

export async function getProvider(id, userId) {
    return await providertb().first().where({ id, userId })
}

export async function getProviders(userId) {
    return await providertb().select().where({ userId }).orderBy("companyName", "asc")
}

export async function createProvider({ userId, companyName, legalId, phone, email, address }) {
    const provider = {
        id: genId(),
        userId,
        companyName,
        legalId,
        phone,
        email,
        address,
        createdAt: new Date().toISOString(),
    }
    await providertb().insert(provider)
    return provider
}

export async function updateProvider(id, userId, data) {
    const existing = await getProvider(id, userId)
    if (!existing) return null

    await providertb().where({ id, userId }).update(data)
    return await getProvider(id, userId)
}

export async function deleteProvider(id, userId) {
    const existing = await getProvider(id, userId)
    if (!existing) return false

    await providertb().where({ id, userId }).delete()
    return true
}
