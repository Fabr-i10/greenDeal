import { getProviders } from "../../js/providerservice.js"
import { getTours } from "../../js/tourservice.js"
import { getSales } from "../../js/salesservice.js"
import { newSaleSubscription, closeSubscription } from "../../js/wsservice.js"
import { urlAPI } from "../../js/api.js"
import { loadSales } from "../../features/sales/sales.js"
import { hideAlert } from "./alerts.js"
import { getUserInitials, formatProfileDate } from "./utils.js"
import { updateSidebarToggle, initSidebarCollapse } from "./sidebar.js"
import { closeProfileDrawer } from "./profile.js"
import { closeSidebar } from "./sidebar.js"
import { dismissOpenModals } from "./modals.js"
import { showView } from "./router.js"

let wsConnection = null

export const requestNotifications = () => {
    if (window.Notification && Notification.permission === "default") {
        Notification.requestPermission()
    }
}

export const startRealtime = async () => {
    if (!navigator.onLine) return

    try {
        const res = await fetch(urlAPI, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "{ __typename }" }),
        })
        const data = await res.json()
        if (!res.ok || data.offline || !data.data?.__typename) return
    } catch {
        return
    }

    closeSubscription()
    wsConnection = newSaleSubscription(async (sale) => {
        console.log("Venta notificada -->", sale)
        if (window.Notification && Notification.permission === "granted") {
            new Notification("GreenDeal", {
                body: `Nueva venta: ${sale.tour?.tourName || "Tour"} - ${sale.quantityPeople} persona(s)`,
            })
        }
        await refreshDashboardCounts()
        const salesView = document.getElementById("salesView")
        if (salesView && !salesView.classList.contains("hidden")) {
            await loadSales()
        }
    })
}

export const stopRealtime = () => {
    closeSubscription()
    wsConnection = null
}

export const reconnectRealtime = () => {
    if (navigator.onLine) startRealtime()
}

export const saveSession = (token, user) => {
    sessionStorage.setItem("access_token", token)
    sessionStorage.setItem("user", JSON.stringify(user))
}

export const clearSession = () => {
    stopRealtime()
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("user")
}

export const populateProfile = (user) => {
    const initials = getUserInitials(user.fullName)
    document.getElementById("userFullName").textContent = user.fullName || "-"
    document.getElementById("userEmail").textContent = user.email || "-"
    document.getElementById("userInitials").textContent = initials
    document.getElementById("userPhone").textContent = user.phone || "No registrado"
    document.getElementById("userCreatedAt").textContent = user.createdAt
        ? formatProfileDate(user.createdAt)
        : "-"
    document.getElementById("sidebarMiniName").textContent = user.fullName || "-"
    document.getElementById("sidebarMiniInitials").textContent = initials
}

export const refreshDashboardCounts = async () => {
    try {
        document.getElementById("providerCount").textContent = (await getProviders()).length
    } catch {
        document.getElementById("providerCount").textContent = "0"
    }
    try {
        document.getElementById("tourCount").textContent = (await getTours()).length
    } catch {
        document.getElementById("tourCount").textContent = "0"
    }
    try {
        document.getElementById("saleCount").textContent = (await getSales()).length
    } catch {
        document.getElementById("saleCount").textContent = "0"
    }
}

export const showDashboard = (user) => {
    document.body.classList.remove("auth-page")
    document.getElementById("authSection").classList.add("hidden")
    document.getElementById("dashboardSection").classList.remove("hidden")
    document.getElementById("btnLogout").classList.remove("hidden")
    updateSidebarToggle()
    initSidebarCollapse()
    populateProfile(user)
    showView("dashboard")
    refreshDashboardCounts()
    requestNotifications()
    startRealtime()
}

export const showAuth = () => {
    dismissOpenModals()
    closeProfileDrawer()
    closeSidebar()
    document.body.classList.add("auth-page")
    document.getElementById("authSection").classList.remove("hidden")
    document.getElementById("dashboardSection").classList.add("hidden")
    document.getElementById("btnLogout").classList.add("hidden")
    updateSidebarToggle()
    hideAlert()
}
