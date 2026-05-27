import bcrypt from "bcrypt"
import { connection } from "./connection.js"
import { genId } from "../utils/idgen.js"

const usertb = () => connection.table("users")
const SALT_ROUNDS = 10

export async function getUser(id) {
    const user = await usertb().first().where({ id })
    if (!user) return null
    return sanitizeUser(user)
}

export async function getUserByEmail(email) {
    return await usertb().first().where({ email })
}

export async function createUser({ fullName, email, password, phone }) {
    const existing = await getUserByEmail(email)
    if (existing) {
        throw new Error("EMAIL_EXISTS")
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const user = {
        id: genId(),
        fullName,
        email,
        password: hashedPassword,
        phone: phone || null,
        createdAt: new Date().toISOString(),
    }

    await usertb().insert(user)
    return sanitizeUser(user)
}

export async function validateCredentials(email, password) {
    const user = await getUserByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    return sanitizeUser(user)
}

function sanitizeUser(user) {
    const { password, ...safeUser } = user
    return safeUser
}
