import { fetchAPI } from "./api.js"

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
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al cargar ventas")
    }
    return data.data.sales.data
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
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al registrar venta")
    }
    return data.data.createSale
}

export const deleteSale = async (id) => {
    const query = `
        mutation deleteSale($id: ID!) {
            deleteSale(id: $id)
        }
    `
    const data = await fetchAPI(query, { id })
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al eliminar venta")
    }
    return data.data.deleteSale
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
