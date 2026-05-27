import { closeProfileDrawer } from "./profile.js"
import { showView } from "./router.js"

export const SIDEBAR_BREAKPOINT = 768
export const SIDEBAR_COLLAPSED_KEY = "gd_sidebar_collapsed"

export const isMobileSidebar = () => window.innerWidth < SIDEBAR_BREAKPOINT
export const isDesktopSidebar = () => window.innerWidth >= SIDEBAR_BREAKPOINT

export const setSidebarCollapsed = (collapsed, persist = true) => {
    const dashboardShell = document.querySelector(".dashboard-shell")
    const sidebarRailToggle = document.getElementById("sidebarRailToggle")
    if (!dashboardShell) return

    if (!isDesktopSidebar()) {
        dashboardShell.classList.remove("sidebar-collapsed")
        sidebarRailToggle?.classList.add("hidden")
        return
    }

    dashboardShell.classList.toggle("sidebar-collapsed", collapsed)

    if (sidebarRailToggle) {
        sidebarRailToggle.classList.remove("hidden")
        sidebarRailToggle.setAttribute("aria-expanded", String(!collapsed))
        sidebarRailToggle.setAttribute("aria-label", collapsed ? "Mostrar menú" : "Ocultar menú")
        sidebarRailToggle.title = collapsed ? "Mostrar menú" : "Ocultar menú"
        const icon = sidebarRailToggle.querySelector("i")
        if (icon) icon.className = collapsed ? "bx bx-chevron-right" : "bx bx-chevron-left"
    }

    if (persist) {
        sessionStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0")
    }
}

export const initSidebarCollapse = () => {
    setSidebarCollapsed(sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1", false)
}

export const toggleSidebarCollapse = () => {
    const dashboardShell = document.querySelector(".dashboard-shell")
    setSidebarCollapsed(!dashboardShell.classList.contains("sidebar-collapsed"))
}

export const closeSidebar = () => {
    const appSidebar = document.getElementById("appSidebar")
    const sidebarBackdrop = document.getElementById("sidebarBackdrop")
    if (!appSidebar) return
    appSidebar.classList.remove("is-open")
    if (sidebarBackdrop) {
        sidebarBackdrop.classList.remove("is-visible")
        sidebarBackdrop.classList.add("hidden")
        sidebarBackdrop.setAttribute("aria-hidden", "true")
    }
    document.body.classList.remove("sidebar-open")
}

export const openSidebar = () => {
    const appSidebar = document.getElementById("appSidebar")
    const sidebarBackdrop = document.getElementById("sidebarBackdrop")
    if (!appSidebar || !isMobileSidebar()) return
    closeProfileDrawer()
    appSidebar.classList.add("is-open")
    if (sidebarBackdrop) {
        sidebarBackdrop.classList.remove("hidden")
        sidebarBackdrop.classList.add("is-visible")
        sidebarBackdrop.setAttribute("aria-hidden", "false")
    }
    document.body.classList.add("sidebar-open")
}

export const toggleSidebar = () => {
    const appSidebar = document.getElementById("appSidebar")
    if (appSidebar?.classList.contains("is-open")) closeSidebar()
    else openSidebar()
}

export const updateSidebarToggle = () => {
    const sidebarToggle = document.getElementById("sidebarToggle")
    const dashboardSection = document.getElementById("dashboardSection")
    const sidebarRailToggle = document.getElementById("sidebarRailToggle")
  const dashboardShell = document.querySelector(".dashboard-shell")
    if (!sidebarToggle) return

    if (dashboardSection.classList.contains("hidden")) {
        sidebarToggle.classList.add("hidden")
        closeSidebar()
        sidebarRailToggle?.classList.add("hidden")
        return
    }

    sidebarToggle.classList.toggle("hidden", !isMobileSidebar())
    if (!isMobileSidebar()) {
        closeSidebar()
        setSidebarCollapsed(sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1", false)
    } else {
        dashboardShell?.classList.remove("sidebar-collapsed")
        sidebarRailToggle?.classList.add("hidden")
    }
}

export const initSidebar = () => {
    document.getElementById("sidebarToggle")?.addEventListener("click", toggleSidebar)
    document.getElementById("sidebarBackdrop")?.addEventListener("click", closeSidebar)
    document.getElementById("sidebarRailToggle")?.addEventListener("click", toggleSidebarCollapse)
    window.addEventListener("resize", updateSidebarToggle)

    document.getElementById("sidebarNav")?.addEventListener("click", (event) => {
        const link = event.target.closest("[data-view]")
        if (!link || link.classList.contains("disabled")) return
        showView(link.dataset.view)
    })

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && document.getElementById("appSidebar")?.classList.contains("is-open")) {
            closeSidebar()
        }
    })
}
