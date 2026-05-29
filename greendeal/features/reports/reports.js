import {
    getMonthlyReport,
    getDateRangeReport,
    getMonthName,
    formatReportDate,
} from "../../js/reportservice.js"
import { getFriendlyMessage } from "../../js/errors.js"
import { formatCurrency } from "../../js/tourservice.js"
import { showAppAlert, hideAppAlert } from "../../shared/js/alerts.js"

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
        body.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay ventas para el periodo.</td></tr>`
        return
    }
    body.innerHTML = topTours
        .map(
            (t, i) => `
            <tr>
                <td class="text-end">${i + 1}</td><td>${t.tourName}</td>
                <td class="text-end">${t.salesCount}</td><td class="text-end">${t.totalPeople}</td>
                <td class="text-end">${formatCurrency(t.totalAmount)}</td>
            </tr>`
        )
        .join("")
}

export const loadReport = async () => {
    const body = document.getElementById("topToursTableBody")
    body.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Generando reporte...</td></tr>`
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
        body.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${message}</td></tr>`
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
