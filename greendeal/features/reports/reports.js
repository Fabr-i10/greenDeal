import {
    getMonthlyReport,
    getDateRangeReport,
    getMonthName,
    formatReportDate,
} from "../../js/reportservice.js"
import { getFriendlyMessage } from "../../js/errors.js"
import { formatCurrency } from "../../js/tourservice.js"
import { showAppAlert, hideAppAlert } from "../../shared/js/alerts.js"
import { dataTd, tableEmptyRow } from "../../shared/js/utils.js"

const getReportMode = () =>
    document.getElementById("reportModeRange").checked ? "range" : "month"

const updateReportFilterMode = () => {
    const isRange = getReportMode() === "range"
    document.getElementById("reportMonthFilters").classList.toggle("hidden", isRange)
    document.getElementById("reportRangeFilters").classList.toggle("hidden", !isRange)
    document.getElementById("reportYear").required = !isRange
    document.getElementById("reportMonth").required = !isRange
    document.getElementById("reportStartDate").required = isRange
    document.getElementById("reportEndDate").required = isRange
    hideAppAlert()
    loadReport()
}

const getReportPeriodLabel = (report) => {
    if (report.startDate && report.endDate) {
        return `${formatReportDate(report.startDate)} - ${formatReportDate(report.endDate)}`
    }
    return `${getMonthName(report.month)} ${report.year}`
}

const renderTopToursTable = (topTours) => {
    const body = document.getElementById("topToursTableBody")
    if (!topTours.length) {
        body.innerHTML = tableEmptyRow(5, "No hay ventas para el periodo.")
        return
    }
    body.innerHTML = topTours
        .map(
            (t, i) => `
            <tr class="mobile-data-card">
                <td class="text-end d-none d-md-table-cell">${i + 1}</td>
                ${dataTd("Tour", `<span class="mobile-rank">${i + 1}</span>${t.tourName}`, "mobile-card-title")}
                ${dataTd("Ventas", t.salesCount, "text-end")}
                ${dataTd("Personas", t.totalPeople, "text-end")}
                ${dataTd("Monto total", formatCurrency(t.totalAmount), "text-end")}
            </tr>`
        )
        .join("")
}

export const loadReport = async () => {
    const body = document.getElementById("topToursTableBody")
    body.innerHTML = tableEmptyRow(5, "Generando reporte...")
    try {
        let report
        if (getReportMode() === "range") {
            const startDate = document.getElementById("reportStartDate").value
            const endDate = document.getElementById("reportEndDate").value
            if (!startDate || !endDate) throw new Error("Selecciona fecha de inicio y fin")
            if (startDate > endDate) throw new Error("La fecha de inicio no puede ser posterior a la fin")
            report = await getDateRangeReport(startDate, endDate)
        } else {
            report = await getMonthlyReport(
                parseInt(document.getElementById("reportYear").value, 10),
                parseInt(document.getElementById("reportMonth").value, 10)
            )
        }
        document.getElementById("reportTotalSales").textContent = formatCurrency(report.totalSales)
        document.getElementById("reportTotalCommissions").textContent = formatCurrency(report.totalCommissions)
        document.getElementById("reportTotalVAT").textContent = formatCurrency(report.totalVAT)
        document.getElementById("reportSalesCount").textContent = report.salesCount
        document.getElementById("reportPeriodLabel").textContent = getReportPeriodLabel(report)
        renderTopToursTable(report.topTours)
    } catch (err) {
        const message = getFriendlyMessage(err, "No se pudo generar el reporte")
        body.innerHTML = tableEmptyRow(5, message, "danger")
        showAppAlert(message, "danger")
    }
}

export const initReportsView = () => {
    const now = new Date()
    document.getElementById("reportYear").value = now.getFullYear()
    document.getElementById("reportMonth").value = String(now.getMonth() + 1)
    document.getElementById("reportStartDate").value = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0]
    document.getElementById("reportEndDate").value = now.toISOString().split("T")[0]
    document.getElementById("reportModeMonth").checked = true
    updateReportFilterMode()
}

export const initReports = () => {
    document.getElementById("reportModeMonth")?.addEventListener("change", updateReportFilterMode)
    document.getElementById("reportModeRange")?.addEventListener("change", updateReportFilterMode)
    document.getElementById("reportYear")?.addEventListener("change", () => {
        hideAppAlert()
        loadReport()
    })
    document.getElementById("reportMonth")?.addEventListener("change", () => {
        hideAppAlert()
        loadReport()
    })
    document.getElementById("reportStartDate")?.addEventListener("change", () => {
        hideAppAlert()
        loadReport()
    })
    document.getElementById("reportEndDate")?.addEventListener("change", () => {
        hideAppAlert()
        loadReport()
    })
}
