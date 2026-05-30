import { loadPartials } from "./load-partials.js"
import { initConfirm } from "./confirm.js"
import { initSidebar } from "./sidebar.js"
import { initProfile } from "./profile.js"
import { showAuth, showDashboard, saveSession, clearSession, reconnectRealtime, stopRealtime } from "./session.js"
import { getMe } from "../../js/authservice.js"
import { resetOfflineBanner } from "../../js/api.js"
import { initAuth } from "../../features/auth/auth.js"
import { initProviders } from "../../features/providers/providers.js"
import { initTours } from "../../features/tours/tours.js"
import { initSales } from "../../features/sales/sales.js"
import { initReports } from "../../features/reports/reports.js"

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/serviceworker.js", { scope: "/" }).catch((err) => {
        console.warn("No se pudo registrar el Service Worker", err)
    })
}

const isAppInstalled = () =>
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true

const showInstallHint = () => {
    if (isAppInstalled() || sessionStorage.getItem("install_hint_dismissed")) return
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (!mobile) return

    const inAppBrowser = /FBAN|FBAV|Instagram|Line\/|MicroMessenger|WhatsApp/i.test(navigator.userAgent)
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    let message
    if (inAppBrowser) {
        message =
            "Abre esta página en Chrome o Safari (menú ⋮ → «Abrir en navegador») para poder instalar GreenDeal."
    } else if (ios) {
        message = "Para instalar: en Safari toca Compartir y elige «Añadir a pantalla de inicio»."
    } else {
        message = "Para instalar: menú ⋮ de Chrome → «Instalar aplicación» o «Añadir a pantalla de inicio»."
    }

    import("./alerts.js").then(({ showAppAlert }) => showAppAlert(message, "info"))
}

window.addEventListener("online", () => {
    resetOfflineBanner()
    reconnectRealtime()
    navigator.serviceWorker?.ready?.then((reg) => {
        reg.sync?.register("new-mutation").catch(() => {})
    })
})

window.addEventListener("offline", () => {
    stopRealtime()
})

const waitForServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) return
    await navigator.serviceWorker.ready
}

const restoreSession = async () => {
    const token = sessionStorage.getItem("access_token")
    const cachedUser = sessionStorage.getItem("user")

    if (!token) {
        showAuth()
        return
    }

    if (!navigator.onLine && cachedUser) {
        showDashboard(JSON.parse(cachedUser))
        return
    }

    try {
        const user = await getMe()
        saveSession(token, user)
        showDashboard(user)
    } catch (err) {
        const authError = err.message === "Sesión inválida" || err.message === "No autorizado"
        if (cachedUser && !authError) {
            showDashboard(JSON.parse(cachedUser))
            return
        }
        clearSession()
        showAuth()
    }
}

const initApp = async () => {
    await waitForServiceWorker()
    await loadPartials()

    initConfirm()
    initSidebar()
    initProfile()
    initAuth()
    initProviders()
    initTours()
    initSales()
    initReports()

    await restoreSession()
    showInstallHint()
}

initApp()
