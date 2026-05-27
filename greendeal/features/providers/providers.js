import {
    getProviders,
    createProvider,
    updateProvider,
    deleteProvider,
} from "../../js/providerservice.js"
import { showAppAlert } from "../../shared/js/alerts.js"
import { showConfirmDialog } from "../../shared/js/confirm.js"

let currentProviders = []
let editingProviderId = null
let providerFormPanel = null

const renderProvidersTable = (providers) => {
    const providersTableBody = document.getElementById("providersTableBody")
    if (!providers.length) {
        providersTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay proveedores registrados.</td></tr>`
        return
    }
    providersTableBody.innerHTML = providers
        .map(
            (p) => `
            <tr>
                <td>${p.companyName}</td><td>${p.legalId}</td><td>${p.phone}</td>
                <td>${p.email}</td><td>${p.address}</td>
                <td class="text-end table-actions">
                    <button type="button" class="btn btn-sm btn-outline-success me-1" data-action="edit" data-id="${p.id}"><i class="bx bx-edit"></i></button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${p.id}"><i class="bx bx-trash"></i></button>
                </td>
            </tr>`
        )
        .join("")
}

export const loadProviders = async () => {
    const body = document.getElementById("providersTableBody")
    body.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Cargando proveedores...</td></tr>`
    try {
        currentProviders = await getProviders()
        renderProvidersTable(currentProviders)
        document.getElementById("providerCount").textContent = currentProviders.length
    } catch (err) {
        body.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${err.message}</td></tr>`
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
            showAppAlert(err.message || "No se pudo guardar el proveedor", "danger")
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
                showAppAlert(err.message || "No se pudo eliminar", "danger")
            }
        }
    })
}
