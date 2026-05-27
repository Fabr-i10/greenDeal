import { connection } from "./connection.js"
import { genId } from "../utils/idgen.js"
import { getTour } from "./tourservice.js"

const saletb = () => connection.table("sales")

export function calculateSaleAmounts(pricePerPerson, quantityPeople) {
    const totalSale = pricePerPerson * quantityPeople
    const commissionTotal = totalSale * 0.2
    const commissionWithoutVAT = commissionTotal / 1.13
    const vatAmount = commissionTotal - commissionWithoutVAT

    return {
        totalSale: roundAmount(totalSale),
        commissionTotal: roundAmount(commissionTotal),
        commissionWithoutVAT: roundAmount(commissionWithoutVAT),
        vatAmount: roundAmount(vatAmount),
    }
}

function roundAmount(value) {
    return Math.round(value * 100) / 100
}

export async function getSale(id, userId) {
    return await saletb().first().where({ id, userId })
}

export async function getSales(userId) {
    return await saletb().select().where({ userId }).orderBy("saleDate", "desc")
}

export async function createSale({ userId, tourId, saleDate, quantityPeople }) {
    const tour = await getTour(tourId, userId)
    if (!tour) {
        throw new Error("TOUR_NOT_FOUND")
    }

    if (!quantityPeople || quantityPeople < 1) {
        throw new Error("INVALID_QUANTITY")
    }

    const amounts = calculateSaleAmounts(tour.pricePerPerson, quantityPeople)

    const sale = {
        id: genId(),
        userId,
        tourId,
        saleDate,
        quantityPeople,
        ...amounts,
        createdAt: new Date().toISOString(),
    }

    await saletb().insert(sale)
    return sale
}

export async function deleteSale(id, userId) {
    const existing = await getSale(id, userId)
    if (!existing) return false

    await saletb().where({ id, userId }).delete()
    return true
}
