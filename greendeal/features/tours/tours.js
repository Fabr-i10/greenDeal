import { getTours, createTour, updateTour, deleteTour, formatCurrency } from "../../js/tourservice.js"
import { getFriendlyMessage } from "../../js/errors.js"
import { showAppAlert } from "../../shared/js/alerts.js"
import { showConfirmDialog } from "../../shared/js/confirm.js"
import { refreshDashboardCounts } from "../../shared/js/session.js"
import { dataTd, tableEmptyRow } from "../../shared/js/utils.js"
import { loadProviderOptions } from "../providers/providers.js"

let currentTours = []
let editingTourId = null
let tourFormPanel = null

const renderToursTable = (tours) => {
    const body = document.getElementById("toursTableBody")
    if (!tours.length) {
        body.innerHTML = tableEmptyRow(6, "No hay tours registrados.")
        return
    }
    body.innerHTML = tours
        .map(
            (t) => `
            <tr class="mobile-data-card">
                ${dataTd("Tour", t.tourName, "mobile-card-title")}
                ${dataTd("Proveedor", t.provider.companyName)}
                ${dataTd("Ubicación", t.location)}
                ${dataTd("Precio/persona", formatCurrency(t.pricePerPerson), "text-end")}
                ${dataTd("Descripción", t.description)}
                <td data-label="Acciones" class="text-end table-actions table-actions-cell">
                    <button type="button" class="btn btn-sm btn-outline-success me-1" data-tour-action="edit" data-id="${t.id}">
                        <i class="bx bx-edit"></i><span class="btn-label-mobile">Editar</span>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-tour-action="delete" data-id="${t.id}">
                        <i class="bx bx-trash"></i><span class="btn-label-mobile">Eliminar</span>
                    </button>
                </td>
            </tr>`
        )
        .join("")
}

export const loadTours = async () => {
    const body = document.getElementById("toursTableBody")
    body.innerHTML = tableEmptyRow(6, "Cargando tours...")
    try {
        currentTours = await getTours()
        renderToursTable(currentTours)
        document.getElementById("tourCount").textContent = currentTours.length
    } catch (err) {
        body.innerHTML = tableEmptyRow(6, getFriendlyMessage(err, "Error al cargar tours"), "danger")
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
