import { getTours, createTour, updateTour, deleteTour, formatCurrency } from "../../js/tourservice.js"
import { getFriendlyMessage } from "../../js/errors.js"
import { showAppAlert } from "../../shared/js/alerts.js"
import { showConfirmDialog } from "../../shared/js/confirm.js"
import { refreshDashboardCounts } from "../../shared/js/session.js"
import { loadProviderOptions } from "../providers/providers.js"

let currentTours = []
let editingTourId = null
let tourFormPanel = null

const renderToursTable = (tours) => {
    const body = document.getElementById("toursTableBody")
    if (!tours.length) {
        body.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay tours registrados.</td></tr>`
        return
    }
    body.innerHTML = tours
        .map(
            (t) => `
            <tr>
                <td>${t.tourName}</td><td>${t.provider.companyName}</td><td>${t.location}</td>
                <td class="text-end">${formatCurrency(t.pricePerPerson)}</td><td>${t.description}</td>
                <td class="text-end table-actions">
                    <button type="button" class="btn btn-sm btn-outline-success me-1" data-tour-action="edit" data-id="${t.id}"><i class="bx bx-edit"></i></button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-tour-action="delete" data-id="${t.id}"><i class="bx bx-trash"></i></button>
                </td>
            </tr>`
        )
        .join("")
}

export const loadTours = async () => {
    const body = document.getElementById("toursTableBody")
    body.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Cargando tours...</td></tr>`
    try {
        currentTours = await getTours()
        renderToursTable(currentTours)
        document.getElementById("tourCount").textContent = currentTours.length
    } catch (err) {
        body.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${getFriendlyMessage(err, "Error al cargar tours")}</td></tr>`
    }
}

const openTourForm = async (tour = null) => {
    try {
        const providers = await loadProviderOptions(tour?.provider?.id || "")
        if (!providers.length) {
            showAppAlert("Debes registrar al menos un proveedor antes de crear tours", "warning")
            return
        }
        editingTourId = tour?.id || null
        document.getElementById("tourFormTitle").textContent = tour ? "Editar tour" : "Nuevo tour"
        document.getElementById("tourName").value = tour?.tourName || ""
        document.getElementById("tourLocation").value = tour?.location || ""
        document.getElementById("tourPricePerPerson").value = tour?.pricePerPerson || ""
        document.getElementById("tourDescription").value = tour?.description || ""
        tourFormPanel.show()
    } catch (err) {
        showAppAlert(getFriendlyMessage(err, "No se pudo abrir el formulario"), "danger")
    }
}

const getTourFormData = () => ({
    tourName: document.getElementById("tourName").value.trim(),
    description: document.getElementById("tourDescription").value.trim(),
    location: document.getElementById("tourLocation").value.trim(),
    pricePerPerson: parseFloat(document.getElementById("tourPricePerPerson").value),
    providerId: document.getElementById("tourProviderId").value,
})

export const initTours = () => {
    tourFormPanel = new bootstrap.Modal(document.getElementById("tourFormPanel"))
    document.getElementById("btnNewTour")?.addEventListener("click", () => openTourForm())
    document.getElementById("tourForm")?.addEventListener("submit", async (e) => {
        e.preventDefault()
        try {
            const input = getTourFormData()
            if (!input.providerId) {
                showAppAlert("Selecciona un proveedor", "warning")
                return
            }
            if (editingTourId) {
                await updateTour(editingTourId, input)
                showAppAlert("Tour actualizado correctamente", "success")
            } else {
                await createTour(input)
                showAppAlert("Tour creado correctamente", "success")
            }
            tourFormPanel.hide()
            document.getElementById("tourForm").reset()
            editingTourId = null
            await loadTours()
            await refreshDashboardCounts()
        } catch (err) {
            showAppAlert(getFriendlyMessage(err, "No se pudo guardar el tour"), "danger")
        }
    })
    document.getElementById("toursTableBody")?.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-tour-action]")
        if (!btn) return
        const tour = currentTours.find((t) => t.id === btn.dataset.id)
        if (!tour) return
        if (btn.dataset.tourAction === "edit") {
            openTourForm(tour)
            return
        }
        if (btn.dataset.tourAction === "delete") {
            const ok = await showConfirmDialog({
                title: "Eliminar tour",
                message: `¿Eliminar el tour "${tour.tourName}"?`,
                confirmText: "Eliminar",
            })
            if (!ok) return
            try {
                await deleteTour(tour.id)
                showAppAlert("Tour eliminado correctamente", "success")
                await loadTours()
                await refreshDashboardCounts()
            } catch (err) {
                showAppAlert(getFriendlyMessage(err, "No se pudo eliminar el tour"), "danger")
            }
        }
    })
}
