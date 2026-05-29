import { fetchAPI } from "./api.js"
import { getGraphQLList, getGraphQLMutation } from "./errors.js"

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
    return getGraphQLList(
        data,
        "providers",
        "Sin conexión: no hay proveedores en caché. Visita esta sección online al menos una vez.",
        "Error al cargar proveedores"
    )
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
    return getGraphQLMutation(data, "createProvider", "Error al crear proveedor")
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
    return getGraphQLMutation(data, "updateProvider", "Error al actualizar proveedor")
}

export const deleteProvider = async (id) => {
    const query = `
        mutation deleteProvider($id: ID!) {
            deleteProvider(id: $id)
        }
    `
    const data = await fetchAPI(query, { id })
    return getGraphQLMutation(data, "deleteProvider", "Error al eliminar proveedor")
}
