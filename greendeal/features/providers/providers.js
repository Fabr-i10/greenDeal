import {
    getProviders,
    createProvider,
    updateProvider,
    deleteProvider,
} from "../../js/providerservice.js"
import { getFriendlyMessage } from "../../js/errors.js"
import { dataTd, tableEmptyRow } from "../../shared/js/utils.js"
import { showAppAlert } from "../../shared/js/alerts.js"
import { showConfirmDialog } from "../../shared/js/confirm.js"

let currentProviders = []
let editingProviderId = null
let providerFormPanel = null

const renderProvidersTable = (providers) => {
    const providersTableBody = document.getElementById("providersTableBody")
    if (!providers.length) {
        providersTableBody.innerHTML = tableEmptyRow(6, "No hay proveedores registrados.")
        return
    }
    providersTableBody.innerHTML = providers
        .map(
            (p) => `
            <tr class="mobile-data-card">
                ${dataTd("Empresa", p.companyName, "mobile-card-title")}
                ${dataTd("Cédula jurídica", p.legalId)}
                ${dataTd("Teléfono", p.phone)}
                ${dataTd("Correo", p.email)}
                ${dataTd("Dirección", p.address)}
                <td data-label="Acciones" class="text-end table-actions table-actions-cell">
                    <button type="button" class="btn btn-sm btn-outline-success me-1" data-action="edit" data-id="${p.id}">
                        <i class="bx bx-edit"></i><span class="btn-label-mobile">Editar</span>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${p.id}">
                        <i class="bx bx-trash"></i><span class="btn-label-mobile">Eliminar</span>
                    </button>
                </td>
            </tr>`
        )
        .join("")
}

export const loadProviders = async () => {
    const body = document.getElementById("providersTableBody")
    body.innerHTML = tableEmptyRow(6, "Cargando proveedores...")
    try {
        currentProviders = await getProviders()
        renderProvidersTable(currentProviders)
        document.getElementById("providerCount").textContent = currentProviders.length
    } catch (err) {
        body.innerHTML = tableEmptyRow(6, getFriendlyMessage(err, "Error al cargar proveedores"), "danger")
    }
}

export const loadProviderOptions = async (selectedId = "") => {
    const select = document.getElementById("tourProviderId")
    const providers = await getProviders()
    select.innerHTML = `<option value="">Seleccione un proveedor</option>`
    providers.forEach((p) => {
        const opt = document.createElement("option")
        opt.value = p.id
        opt.textContent = p.companyName
        if (p.id === selectedId) opt.selected = true
        select.appendChild(opt)
    })
    return providers
}

const openProviderForm = (provider = null) => {
    editingProviderId = provider?.id || null
    document.getElementById("providerFormTitle").textContent = provider ? "Editar proveedor" : "Nuevo proveedor"
    document.getElementById("providerCompanyName").value = provider?.companyName || ""
    document.getElementById("providerLegalId").value = provider?.legalId || ""
    document.getElementById("providerPhone").value = provider?.phone || ""
    document.getElementById("providerEmail").value = provider?.email || ""
    document.getElementById("providerAddress").value = provider?.address || ""
    providerFormPanel.show()
}

const getProviderFormData = () => ({
    companyName: document.getElementById("providerCompanyName").value.trim(),
    legalId: document.getElementById("providerLegalId").value.trim(),
    phone: document.getElementById("providerPhone").value.trim(),
    email: document.getElementById("providerEmail").value.trim(),
    address: document.getElementById("providerAddress").value.trim(),
})

export const initProviders = () => {
    providerFormPanel = new bootstrap.Modal(document.getElementById("providerFormPanel"))
    document.getElementById("btnNewProvider")?.addEventListener("click", () => openProviderForm())
    document.getElementById("providerForm")?.addEventListener("submit", async (e) => {
        e.preventDefault()
        try {
            const input = getProviderFormData()
            if (editingProviderId) {
                await updateProvider(editingProviderId, input)
                showAppAlert("Proveedor actualizado correctamente", "success")
            } else {
                await createProvider(input)
                showAppAlert("Proveedor creado correctamente", "success")
            }
            providerFormPanel.hide()
            document.getElementById("providerForm").reset()
            editingProviderId = null
            await loadProviders()
        } catch (err) {
            showAppAlert(getFriendlyMessage(err, "No se pudo guardar el proveedor"), "danger")
        }
    })
    document.getElementById("providersTableBody")?.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-action]")
        if (!btn) return
        const provider = currentProviders.find((p) => p.id === btn.dataset.id)
        if (!provider) return
        if (btn.dataset.action === "edit") {
            openProviderForm(provider)
            return
        }
        if (btn.dataset.action === "delete") {
            const ok = await showConfirmDialog({
                title: "Eliminar proveedor",
                message: `¿Eliminar el proveedor "${provider.companyName}"?`,
                confirmText: "Eliminar",
            })
            if (!ok) return
            try {
                await deleteProvider(provider.id)
                showAppAlert("Proveedor eliminado correctamente", "success")
                await loadProviders()
            } catch (err) {
                showAppAlert(getFriendlyMessage(err, "No se pudo eliminar el proveedor"), "danger")
            }
        }
    })
}
