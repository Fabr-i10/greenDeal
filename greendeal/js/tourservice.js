import { fetchAPI } from "./api.js"

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
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al cargar tours")
    }
    return data.data.tours.data
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
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al crear tour")
    }
    return data.data.createTour
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
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al actualizar tour")
    }
    return data.data.updateTour
}

export const deleteTour = async (id) => {
    const query = `
        mutation deleteTour($id: ID!) {
            deleteTour(id: $id)
        }
    `
    const data = await fetchAPI(query, { id })
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al eliminar tour")
    }
    return data.data.deleteTour
}

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 0,
    }).format(amount)
}
