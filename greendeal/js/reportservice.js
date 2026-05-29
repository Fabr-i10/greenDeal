import { fetchAPI } from "./api.js"
import { getGraphQLField } from "./errors.js"

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

const OFFLINE_REPORT_MSG =
    "Sin conexión: los reportes requieren internet y no están disponibles offline."

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
    return getGraphQLField(data, "monthlyReport", {
        offlineMessage: OFFLINE_REPORT_MSG,
        fallback: "No se pudo generar el reporte mensual.",
    })
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
    return getGraphQLField(data, "dateRangeReport", {
        offlineMessage: OFFLINE_REPORT_MSG,
        fallback: "No se pudo generar el reporte por rango de fechas.",
    })
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
