import { fetchAPI, urlLogin } from "./api.js"

export const loginUser = async (email, password) => {
    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    }
    const result = await fetch(urlLogin, options)
    if (!result.ok) {
        throw new Error("Credenciales inválidas")
    }
    return await result.json()
}

export const registerUser = async (input) => {
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
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al registrar")
    }
    return data.data.register
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
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Sesión inválida")
    }
    return data.data.me
}
