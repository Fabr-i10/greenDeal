import { fetchAPI } from "./api.js"

const reportBaseFields = `
    totalSales
    totalCommissions
    totalVAT
    salesCount
    topTours {
        tourId
        tourName
        salesCount
        totalPeople
        totalAmount
    }
`

export const getMonthlyReport = async (year, month) => {
    const query = `
        query monthlyReport($year: Int!, $month: Int!) {
            monthlyReport(year: $year, month: $month) {
                year
                month
                ${reportBaseFields}
            }
        }
    `
    const data = await fetchAPI(query, { year, month })
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al generar reporte")
    }
    return data.data.monthlyReport
}

export const getDateRangeReport = async (startDate, endDate) => {
    const query = `
        query dateRangeReport($startDate: String!, $endDate: String!) {
            dateRangeReport(startDate: $startDate, endDate: $endDate) {
                startDate
                endDate
                ${reportBaseFields}
            }
        }
    `
    const data = await fetchAPI(query, { startDate, endDate })
    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Error al generar reporte")
    }
    return data.data.dateRangeReport
}

export const getMonthName = (month) => {
    const names = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ]
    return names[month - 1] || ""
}

export const formatReportDate = (value) => {
    if (!value) return "-"
    const [year, month, day] = value.split("-")
    return `${day}/${month}/${year}`
}
