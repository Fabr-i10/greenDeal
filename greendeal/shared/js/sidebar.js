import { closeProfileDrawer, toggleProfileDrawer } from "./profile.js"
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
        if (icon) icon.className = collapsed ? "bx bx-chevrons-right" : "bx bx-chevrons-left"
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
    document.body.classList.remove("sidebar-open")
}

export const syncNavActive = (viewName) => {
    document.querySelectorAll("#sidebarNav .nav-link, .mobile-nav-item").forEach((el) => {
        const active = el.dataset.view === viewName
        el.classList.toggle("active", active)
        if (el.classList.contains("mobile-nav-item")) {
            el.setAttribute("aria-current", active ? "page" : "false")
        }
    })
}

export const updateMobileChrome = () => {
    const dashboardSection = document.getElementById("dashboardSection")
    const mobileBottomNav = document.getElementById("mobileBottomNav")
    const profileHeaderBtn = document.getElementById("profileHeaderBtn")
    const inDashboard = dashboardSection && !dashboardSection.classList.contains("hidden")
    const mobile = isMobileSidebar()

    document.body.classList.toggle("app-dashboard", inDashboard)
    document.body.classList.toggle("has-mobile-nav", inDashboard && mobile)

    if (mobileBottomNav) {
        mobileBottomNav.classList.toggle("hidden", !inDashboard || !mobile)
        mobileBottomNav.classList.toggle("is-visible", inDashboard && mobile)
    }

    if (profileHeaderBtn) {
        const showProfile = inDashboard && mobile
        profileHeaderBtn.classList.toggle("hidden", !showProfile)
        if (!showProfile) profileHeaderBtn.setAttribute("aria-expanded", "false")
    }
}

export const updateSidebarToggle = () => {
    const dashboardSection = document.getElementById("dashboardSection")
    const sidebarRailToggle = document.getElementById("sidebarRailToggle")
    const dashboardShell = document.querySelector(".dashboard-shell")

    if (dashboardSection?.classList.contains("hidden")) {
        closeSidebar()
        sidebarRailToggle?.classList.add("hidden")
        closeProfileDrawer()
        updateMobileChrome()
        return
    }

    if (!isMobileSidebar()) {
        setSidebarCollapsed(sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1", false)
    } else {
        dashboardShell?.classList.remove("sidebar-collapsed")
        sidebarRailToggle?.classList.add("hidden")
        closeSidebar()
    }
    updateMobileChrome()
}

const handleNavClick = (event) => {
    const link = event.target.closest("[data-view]")
    if (!link || link.classList.contains("disabled")) return
    showView(link.dataset.view)
}

export const initSidebar = () => {
    document.getElementById("profileHeaderBtn")?.addEventListener("click", (event) => {
        event.preventDefault()
        toggleProfileDrawer()
        const expanded = document.getElementById("profileDrawer")?.classList.contains("is-open")
        document.getElementById("profileHeaderBtn")?.setAttribute("aria-expanded", String(!!expanded))
    })

    document.getElementById("sidebarRailToggle")?.addEventListener("click", toggleSidebarCollapse)
    window.addEventListener("resize", updateSidebarToggle)

    document.getElementById("sidebarNav")?.addEventListener("click", handleNavClick)
    document.getElementById("mobileBottomNav")?.addEventListener("click", handleNavClick)

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return
        if (document.getElementById("profileDrawer")?.classList.contains("is-open")) {
            closeProfileDrawer()
            document.getElementById("profileHeaderBtn")?.setAttribute("aria-expanded", "false")
        }
    })
}
