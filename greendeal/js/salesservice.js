import { fetchAPI } from "./api.js"
import { getGraphQLList, getGraphQLMutation } from "./errors.js"

export const getSales = async () => {
    const query = `
        query sales {
            sales {
                data {
                    id
                    saleDate
                    quantityPeople
                    totalSale
                    commissionTotal
                    commissionWithoutVAT
                    vatAmount
                    createdAt
                    tour {
                        id
                        tourName
                        pricePerPerson
                    }
                }
            }
        }
    `
    const data = await fetchAPI(query)
    return getGraphQLList(
        data,
        "sales",
        "Sin conexión: no hay ventas en caché. Visita esta sección online al menos una vez.",
        "Error al cargar ventas"
    )
}

export const createSale = async (input) => {
    const query = `
        mutation createSale($input: SaleInput!) {
            createSale(input: $input) {
                id
                saleDate
                quantityPeople
                totalSale
                commissionTotal
                commissionWithoutVAT
                vatAmount
                tour {
                    tourName
                }
            }
        }
    `
    const data = await fetchAPI(query, { input })
    return getGraphQLMutation(data, "createSale", "Error al registrar venta")
}

export const deleteSale = async (id) => {
    const query = `
        mutation deleteSale($id: ID!) {
            deleteSale(id: $id)
        }
    `
    const data = await fetchAPI(query, { id })
    return getGraphQLMutation(data, "deleteSale", "Error al eliminar venta")
}

export const calculateSalePreview = (pricePerPerson, quantityPeople) => {
    const totalSale = pricePerPerson * quantityPeople
    const commissionTotal = totalSale * 0.2
    const commissionWithoutVAT = commissionTotal / 1.13
    const vatAmount = commissionTotal - commissionWithoutVAT

    return {
        totalSale: Math.round(totalSale * 100) / 100,
        commissionTotal: Math.round(commissionTotal * 100) / 100,
        commissionWithoutVAT: Math.round(commissionWithoutVAT * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
    }
}
