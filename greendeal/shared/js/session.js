import { getProviders } from "../../js/providerservice.js"
import { getTours } from "../../js/tourservice.js"
import { getSales } from "../../js/salesservice.js"
import { hideAlert } from "./alerts.js"
import { getUserInitials, formatProfileDate } from "./utils.js"
import { updateSidebarToggle, initSidebarCollapse } from "./sidebar.js"
import { closeProfileDrawer } from "./profile.js"
import { closeSidebar } from "./sidebar.js"
import { showView } from "./router.js"

export const saveSession = (token, user) => {
    sessionStorage.setItem("access_token", token)
    sessionStorage.setItem("user", JSON.stringify(user))
}

export const clearSession = () => {
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
    document.getElementById("authSection").classList.add("hidden")
    document.getElementById("dashboardSection").classList.remove("hidden")
    document.getElementById("btnLogout").classList.remove("hidden")
    updateSidebarToggle()
    initSidebarCollapse()
    populateProfile(user)
    showView("dashboard")
    refreshDashboardCounts()
}

export const showAuth = () => {
    closeProfileDrawer()
    closeSidebar()
    document.getElementById("authSection").classList.remove("hidden")
    document.getElementById("dashboardSection").classList.add("hidden")
    document.getElementById("btnLogout").classList.add("hidden")
    document.getElementById("sidebarToggle")?.classList.add("hidden")
    hideAlert()
}
