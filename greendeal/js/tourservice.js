import { fetchAPI } from "./api.js"
import { getGraphQLList, getGraphQLMutation } from "./errors.js"

export const getTours = async () => {
    const query = `
        query tours {
            tours {
                data {
                    id
                    tourName
                    description
                    location
                    pricePerPerson
                    createdAt
                    provider {
                        id
                        companyName
                    }
                }
            }
        }
    `
    const data = await fetchAPI(query)
    return getGraphQLList(
        data,
        "tours",
        "Sin conexión: no hay tours en caché. Visita esta sección online al menos una vez.",
        "Error al cargar tours"
    )
}

export const createTour = async (input) => {
    const query = `
        mutation createTour($input: TourInput!) {
            createTour(input: $input) {
                id
                tourName
                location
                pricePerPerson
            }
        }
    `
    const data = await fetchAPI(query, { input })
    return getGraphQLMutation(data, "createTour", "Error al crear tour")
}

export const updateTour = async (id, input) => {
    const query = `
        mutation updateTour($id: ID!, $input: TourInput!) {
            updateTour(id: $id, input: $input) {
                id
                tourName
                location
                pricePerPerson
            }
        }
    `
    const data = await fetchAPI(query, { id, input })
    return getGraphQLMutation(data, "updateTour", "Error al actualizar tour")
}

export const deleteTour = async (id) => {
    const query = `
        mutation deleteTour($id: ID!) {
            deleteTour(id: $id)
        }
    `
    const data = await fetchAPI(query, { id })
    return getGraphQLMutation(data, "deleteTour", "Error al eliminar tour")
}

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 0,
    }).format(amount)
}
