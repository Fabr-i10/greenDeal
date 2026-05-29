import { fetchAPI, urlLogin } from "./api.js"
import { assertGraphQL, getGraphQLField, getGraphQLMutation } from "./errors.js"

export const loginUser = async (email, password) => {
    if (!navigator.onLine) {
        throw new Error("Sin conexión. Necesitas internet para iniciar sesión.")
    }

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    }

    let result
    try {
        result = await fetch(urlLogin, options)
    } catch {
        throw new Error("Sin conexión. Necesitas internet para iniciar sesión.")
    }

    if (!result.ok) {
        throw new Error("Credenciales inválidas")
    }
    return await result.json()
}

export const registerUser = async (input) => {
    if (!navigator.onLine) {
        throw new Error("Sin conexión. Necesitas internet para registrarte.")
    }

    const query = `
        mutation register($input: RegisterInput!) {
            register(input: $input) {
                token
                user {
                    id
                    fullName
                    email
                    phone
                }
            }
        }
    `
    const data = await fetchAPI(query, { input })
    return getGraphQLMutation(data, "register", "Error al registrar la cuenta")
}

export const getMe = async () => {
    const query = `
        query me {
            me {
                id
                fullName
                email
                phone
                createdAt
            }
        }
    `
    const data = await fetchAPI(query)
    assertGraphQL(data, "Sesión inválida")

    if (data.data?.me) return data.data.me

    if (data.offline) {
        const cached = sessionStorage.getItem("user")
        if (cached) return JSON.parse(cached)
        throw new Error("Sin conexión: no hay datos de sesión en caché.")
    }

    throw new Error("Sesión inválida. Inicia sesión nuevamente.")
}
