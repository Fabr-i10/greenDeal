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

const hideAppSplash = () => {
    const splash = document.getElementById("appSplash")
    document.body.classList.remove("app-is-loading")
    if (!splash) return
    splash.setAttribute("aria-busy", "false")
    splash.classList.add("is-leaving")
    const remove = () => splash.remove()
    splash.addEventListener("transitionend", remove, { once: true })
    setTimeout(remove, 450)
}

const initApp = async () => {
    try {
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
    } finally {
        hideAppSplash()
    }
}

initApp()
