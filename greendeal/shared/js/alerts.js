export const showAlert = (message, type = "danger", target = document.getElementById("alertBox")) => {
    if (!target) return
    target.textContent = message
    target.className = `alert alert-${type}`
}

export const hideAlert = (target = document.getElementById("alertBox")) => {
    if (!target) return
    target.className = "alert hidden"
}

export const showAppAlert = (message, type = "danger") => {
    showAlert(message, type, document.getElementById("appAlert"))
}

export const hideAppAlert = () => {
    hideAlert(document.getElementById("appAlert"))
}
