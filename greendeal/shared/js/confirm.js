let confirmFormPanel = null
let confirmResolver = null
let confirmAccepted = false

export const showConfirmDialog = ({
    title = "Confirmar acción",
    message = "¿Estás seguro?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    confirmClass = "btn-danger",
}) =>
    new Promise((resolve) => {
        document.getElementById("confirmFormTitle").textContent = title
        document.getElementById("confirmFormMessage").textContent = message
        const confirmBtn = document.getElementById("confirmFormConfirm")
        confirmBtn.textContent = confirmText
        confirmBtn.className = `btn btn-sm ${confirmClass}`
        document.getElementById("confirmFormCancel").textContent = cancelText
        confirmAccepted = false
        confirmResolver = resolve
        confirmFormPanel.show()
    })

export const initConfirm = () => {
    const confirmFormEl = document.getElementById("confirmFormPanel")
    const confirmBtn = document.getElementById("confirmFormConfirm")
    confirmFormPanel = new bootstrap.Modal(confirmFormEl)

    confirmBtn.addEventListener("click", () => {
        confirmAccepted = true
        confirmFormPanel.hide()
    })

    confirmFormEl.addEventListener("hidden.bs.modal", () => {
        if (confirmResolver) {
            confirmResolver(confirmAccepted)
            confirmResolver = null
        }
        confirmAccepted = false
    })
}
