import { getSales, createSale, deleteSale, calculateSalePreview } from "../../js/salesservice.js"
import { getTours, formatCurrency } from "../../js/tourservice.js"
import { showAppAlert } from "../../shared/js/alerts.js"
import { showConfirmDialog } from "../../shared/js/confirm.js"
import { refreshDashboardCounts } from "../../shared/js/session.js"
import { formatDate } from "../../shared/js/utils.js"

let currentSales = []
let salesTourOptions = []
let saleFormPanel = null

const renderSalesTable = (sales) => {
    const body = document.getElementById("salesTableBody")
    if (!sales.length) {
        body.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No hay ventas registradas.</td></tr>`
        return
    }
    body.innerHTML = sales
        .map(
            (s) => `
            <tr>
                <td>${formatDate(s.saleDate)}</td><td>${s.tour.tourName}</td>
                <td class="text-end">${s.quantityPeople}</td>
                <td class="text-end">${formatCurrency(s.totalSale)}</td>
                <td class="text-end">${formatCurrency(s.commissionTotal)}</td>
                <td class="text-end">${formatCurrency(s.commissionWithoutVAT)}</td>
                <td class="text-end">${formatCurrency(s.vatAmount)}</td>
                <td class="text-end table-actions">
                    <button type="button" class="btn btn-sm btn-outline-danger" data-sale-action="delete" data-id="${s.id}"><i class="bx bx-trash"></i></button>
                </td>
            </tr>`
        )
        .join("")
}

export const loadSales = async () => {
    const body = document.getElementById("salesTableBody")
    body.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Cargando ventas...</td></tr>`
    try {
        currentSales = await getSales()
        renderSalesTable(currentSales)
        document.getElementById("saleCount").textContent = currentSales.length
    } catch (err) {
        body.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">${err.message}</td></tr>`
    }
}

const loadSaleTourOptions = async () => {
    const saleTourSelect = document.getElementById("saleTourId")
    salesTourOptions = await getTours()
    saleTourSelect.innerHTML = `<option value="">Seleccione un tour</option>`
    salesTourOptions.forEach((t) => {
        const opt = document.createElement("option")
        opt.value = t.id
        opt.textContent = `${t.tourName} (${formatCurrency(t.pricePerPerson)})`
        opt.dataset.price = t.pricePerPerson
        saleTourSelect.appendChild(opt)
    })
    return salesTourOptions
}

const updateSalePreview = () => {
    const saleTourSelect = document.getElementById("saleTourId")
    const saleQuantityInput = document.getElementById("saleQuantityPeople")
    const selected = saleTourSelect.selectedOptions[0]
    const price = parseFloat(selected?.dataset?.price || 0)
    const qty = parseInt(saleQuantityInput.value, 10) || 0
    const preview = !price || qty < 1 ? calculateSalePreview(0, 0) : calculateSalePreview(price, qty)
    document.getElementById("previewTotalSale").textContent = formatCurrency(preview.totalSale)
    document.getElementById("previewCommissionTotal").textContent = formatCurrency(preview.commissionTotal)
    document.getElementById("previewCommissionWithoutVAT").textContent = formatCurrency(preview.commissionWithoutVAT)
    document.getElementById("previewVatAmount").textContent = formatCurrency(preview.vatAmount)
}

const openSaleForm = async () => {
    try {
        const tours = await loadSaleTourOptions()
        if (!tours.length) {
            showAppAlert("Debes registrar al menos un tour antes de registrar ventas", "warning")
            return
        }
        document.getElementById("saleForm").reset()
        document.getElementById("saleDate").value = new Date().toISOString().split("T")[0]
        document.getElementById("saleQuantityPeople").value = "1"
        updateSalePreview()
        saleFormPanel.show()
    } catch (err) {
        showAppAlert(err.message || "No se pudo abrir el formulario", "danger")
    }
}

export const initSales = () => {
    saleFormPanel = new bootstrap.Modal(document.getElementById("saleFormPanel"))
    document.getElementById("btnNewSale")?.addEventListener("click", () => openSaleForm())
    document.getElementById("saleTourId")?.addEventListener("change", updateSalePreview)
    document.getElementById("saleQuantityPeople")?.addEventListener("input", updateSalePreview)
    document.getElementById("saleForm")?.addEventListener("submit", async (e) => {
        e.preventDefault()
        try {
            const input = {
                tourId: document.getElementById("saleTourId").value,
                saleDate: document.getElementById("saleDate").value,
                quantityPeople: parseInt(document.getElementById("saleQuantityPeople").value, 10),
            }
            if (!input.tourId) {
                showAppAlert("Selecciona un tour", "warning")
                return
            }
            if (!input.quantityPeople || input.quantityPeople < 1) {
                showAppAlert("La cantidad debe ser mayor a cero", "warning")
                return
            }
            await createSale(input)
            showAppAlert("Venta registrada correctamente", "success")
            saleFormPanel.hide()
            document.getElementById("saleForm").reset()
            await loadSales()
            await refreshDashboardCounts()
        } catch (err) {
            showAppAlert(err.message || "No se pudo registrar la venta", "danger")
        }
    })
    document.getElementById("salesTableBody")?.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-sale-action]")
        if (!btn) return
        const sale = currentSales.find((s) => s.id === btn.dataset.id)
        if (!sale || btn.dataset.saleAction !== "delete") return
        const ok = await showConfirmDialog({
            title: "Eliminar venta",
            message: `¿Eliminar la venta del tour "${sale.tour.tourName}"?`,
            confirmText: "Eliminar",
        })
        if (!ok) return
        try {
            await deleteSale(sale.id)
            showAppAlert("Venta eliminada correctamente", "success")
            await loadSales()
            await refreshDashboardCounts()
        } catch (err) {
            showAppAlert(err.message || "No se pudo eliminar", "danger")
        }
    })
}
