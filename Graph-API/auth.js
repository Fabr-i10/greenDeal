import { expressjwt } from "express-jwt"
import jwt from "jsonwebtoken"
import { validateCredentials } from "./services/userservice.js"

const secret = Buffer.from("greendeal-fundamentos-web", "base64")

export const authMiddleware = expressjwt({
    algorithms: ["HS256"],
    credentialsRequired: false,
    secret,
})

export async function getToken(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" })
    }

    const user = await validateCredentials(email, password)
    if (!user) {
        return res.sendStatus(401)
    }

    const payload = {
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
    }

    const token = jwt.sign(payload, secret)
    res.json({ token, user })
}

export function buildToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
    }

    return jwt.sign(payload, secret)
}

export async function verifyToken(token) {
    try {
        return jwt.verify(token, secret)
    } catch (err) {
        console.log(err)
        return null
    }
}
