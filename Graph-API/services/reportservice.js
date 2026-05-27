import { connection } from "./connection.js"

const saletb = () => connection.table("sales")
const tourtb = () => connection.table("tours")

function roundAmount(value) {
    return Math.round(value * 100) / 100
}

function buildReport(sales, userId, period) {
    const totals = sales.reduce(
        (acc, sale) => {
            acc.totalSales += sale.totalSale
            acc.totalCommissions += sale.commissionTotal
            acc.totalVAT += sale.vatAmount
            return acc
        },
        { totalSales: 0, totalCommissions: 0, totalVAT: 0 }
    )

    const tourStats = {}

    for (const sale of sales) {
        if (!tourStats[sale.tourId]) {
            tourStats[sale.tourId] = {
                tourId: sale.tourId,
                salesCount: 0,
                totalPeople: 0,
                totalAmount: 0,
            }
        }

        tourStats[sale.tourId].salesCount += 1
        tourStats[sale.tourId].totalPeople += sale.quantityPeople
        tourStats[sale.tourId].totalAmount += sale.totalSale
    }

    const tourIds = Object.keys(tourStats)
    const tours = tourIds.length
        ? tourtb().select("id", "tourName").where({ userId }).whereIn("id", tourIds)
        : []

    return Promise.resolve(tours).then((tourRows) => {
        const tourNames = Object.fromEntries(tourRows.map((tour) => [tour.id, tour.tourName]))

        const topTours = Object.values(tourStats)
            .map((item) => ({
                ...item,
                tourName: tourNames[item.tourId] || "Tour no disponible",
                totalAmount: roundAmount(item.totalAmount),
            }))
            .sort((a, b) => b.salesCount - a.salesCount || b.totalPeople - a.totalPeople)

        return {
            ...period,
            totalSales: roundAmount(totals.totalSales),
            totalCommissions: roundAmount(totals.totalCommissions),
            totalVAT: roundAmount(totals.totalVAT),
            salesCount: sales.length,
            topTours,
        }
    })
}

export async function getMonthlyReport(userId, year, month) {
    const monthStr = String(month).padStart(2, "0")
    const prefix = `${year}-${monthStr}`

    const sales = await saletb()
        .select()
        .where({ userId })
        .andWhere("saleDate", "like", `${prefix}%`)

    return buildReport(sales, userId, {
        year,
        month,
        startDate: null,
        endDate: null,
    })
}

export async function getDateRangeReport(userId, startDate, endDate) {
    const sales = await saletb()
        .select()
        .where({ userId })
        .andWhere("saleDate", ">=", startDate)
        .andWhere("saleDate", "<=", endDate)

    return buildReport(sales, userId, {
        year: null,
        month: null,
        startDate,
        endDate,
    })
}
