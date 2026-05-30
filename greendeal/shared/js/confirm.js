let confirmFormPanel = null
let confirmResolver = null
let confirmAccepted = false

export const showConfirmDialog = ({
    title = "Confirmar acción",
    message = "¿Estás seguro?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    confirmClass = "btn-danger",
    iconClass = "bx-trash",
    iconTone = "danger",
}) =>
    new Promise((resolve) => {
        document.getElementById("confirmFormTitle").textContent = title
        document.getElementById("confirmFormMessage").textContent = message
        const confirmBtn = document.getElementById("confirmFormConfirm")
        confirmBtn.textContent = confirmText
        confirmBtn.className = `btn btn-sm ${confirmClass}`
        document.getElementById("confirmFormCancel").textContent = cancelText

        const iconWrap = document.querySelector("#confirmFormPanel .confirm-form-icon")
        const iconEl = iconWrap?.querySelector("i")
        if (iconEl) iconEl.className = `bx ${iconClass}`
        iconWrap?.classList.remove("confirm-form-icon--danger", "confirm-form-icon--neutral")
        iconWrap?.classList.add(`confirm-form-icon--${iconTone}`)
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
