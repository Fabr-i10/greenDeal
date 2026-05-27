import { loadPartials } from "./load-partials.js"
import { initConfirm } from "./confirm.js"
import { initSidebar } from "./sidebar.js"
import { initProfile } from "./profile.js"
import { showAuth, showDashboard, saveSession, clearSession } from "./session.js"
import { getMe } from "../../js/authservice.js"
import { initAuth } from "../../features/auth/auth.js"
import { initProviders } from "../../features/providers/providers.js"
import { initTours } from "../../features/tours/tours.js"
import { initSales } from "../../features/sales/sales.js"
import { initReports } from "../../features/reports/reports.js"

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/serviceworker.js").catch(() => {})
}

const initApp = async () => {
    await loadPartials()

    initConfirm()
    initSidebar()
    initProfile()
    initAuth()
    initProviders()
    initTours()
    initSales()
    initReports()

    const token = sessionStorage.getItem("access_token")
    if (!token) {
        showAuth()
        return
    }

    try {
        const user = await getMe()
        saveSession(token, user)
        showDashboard(user)
    } catch {
        clearSession()
        showAuth()
    }
}

initApp()
