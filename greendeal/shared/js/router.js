import { hideAppAlert } from "./alerts.js"
import { dismissOpenModals } from "./modals.js"
import { closeProfileDrawer } from "./profile.js"
import { closeSidebar, syncNavActive } from "./sidebar.js"
import { loadProviders } from "../../features/providers/providers.js"
import { loadTours } from "../../features/tours/tours.js"
import { loadSales } from "../../features/sales/sales.js"
import { initReportsView } from "../../features/reports/reports.js"

export const showView = (viewName) => {
    dismissOpenModals()
    closeProfileDrawer()
    closeSidebar()

    document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.add("hidden"))
    document.getElementById(`${viewName}View`)?.classList.remove("hidden")

    syncNavActive(viewName)

    hideAppAlert()

    if (viewName === "providers") loadProviders()
    if (viewName === "tours") loadTours()
    if (viewName === "sales") loadSales()
    if (viewName === "reports") initReportsView()
}
