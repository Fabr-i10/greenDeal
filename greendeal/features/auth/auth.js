import { loginUser, registerUser } from "../../js/authservice.js"
import { getFriendlyMessage } from "../../js/errors.js"
import { hideAlert, showAlert } from "../../shared/js/alerts.js"
import { showConfirmDialog } from "../../shared/js/confirm.js"
import { saveSession, showDashboard, showAuth, clearSession } from "../../shared/js/session.js"

export const initAuth = () => {
    const authTabs = document.getElementById("authTabs")
    const loginForm = document.getElementById("loginForm")
    const registerForm = document.getElementById("registerForm")

    authTabs?.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-tab]")
        if (!tab) return
        authTabs.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"))
        tab.classList.add("active")
        if (tab.dataset.tab === "login") {
            loginForm.classList.remove("hidden")
            registerForm.classList.add("hidden")
        } else {
            loginForm.classList.add("hidden")
            registerForm.classList.remove("hidden")
        }
        hideAlert()
    })

    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault()
        hideAlert()
        try {
            const email = document.getElementById("loginEmail").value.trim()
            const password = document.getElementById("loginPassword").value
            const response = await loginUser(email, password)
            saveSession(response.token, response.user)
            showDashboard(response.user)
        } catch (err) {
            showAlert(getFriendlyMessage(err, "No se pudo iniciar sesión"))
        }
    })

    registerForm?.addEventListener("submit", async (event) => {
        event.preventDefault()
        hideAlert()
        try {
            const input = {
                fullName: document.getElementById("registerFullName").value.trim(),
                email: document.getElementById("registerEmail").value.trim(),
                phone: document.getElementById("registerPhone").value.trim() || null,
                password: document.getElementById("registerPassword").value,
            }
            const response = await registerUser(input)
            saveSession(response.token, response.user)
            showDashboard(response.user)
        } catch (err) {
            showAlert(getFriendlyMessage(err, "No se pudo registrar la cuenta"))
        }
    })

    document.getElementById("btnLogout")?.addEventListener("click", async () => {
        const ok = await showConfirmDialog({
            title: "Cerrar sesión",
            message: "¿Estás seguro de que quieres cerrar sesión?",
            confirmText: "Cerrar sesión",
            cancelText: "Cancelar",
            confirmClass: "btn-success",
            iconClass: "bx-log-out",
            iconTone: "neutral",
        })
        if (!ok) return

        clearSession()
        showAuth()
        loginForm?.reset()
        registerForm?.reset()
    })
}
