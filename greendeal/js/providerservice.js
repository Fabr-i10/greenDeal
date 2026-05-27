import { fetchAPI } from "./api.js"

export const getProviders = async () => {
    const query = `
        query providers {
            providers {
                data {
                    id
                    companyName
                    legalId
                    phone
                    email
                    address
                    createdAt
                }
            }
        }
    `
    const data = await fetchAPI(query)
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al cargar proveedores")
    }
    return data.data.providers.data
}

export const createProvider = async (input) => {
    const query = `
        mutation createProvider($input: ProviderInput!) {
            createProvider(input: $input) {
                id
                companyName
                legalId
                phone
                email
                address
            }
        }
    `
    const data = await fetchAPI(query, { input })
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al crear proveedor")
    }
    return data.data.createProvider
}

export const updateProvider = async (id, input) => {
    const query = `
        mutation updateProvider($id: ID!, $input: ProviderInput!) {
            updateProvider(id: $id, input: $input) {
                id
                companyName
                legalId
                phone
                email
                address
            }
        }
    `
    const data = await fetchAPI(query, { id, input })
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al actualizar proveedor")
    }
    return data.data.updateProvider
}

export const deleteProvider = async (id) => {
    const query = `
        mutation deleteProvider($id: ID!) {
            deleteProvider(id: $id)
        }
    `
    const data = await fetchAPI(query, { id })
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al eliminar proveedor")
    }
    return data.data.deleteProvider
}
