import { closeSidebar } from "./sidebar.js"

export const closeProfileDrawer = () => {
    const profileDrawer = document.getElementById("profileDrawer")
    const profileMiniCard = document.getElementById("profileMiniCard")
    profileDrawer?.classList.remove("is-open")
    profileDrawer?.setAttribute("aria-hidden", "true")
    profileMiniCard?.classList.remove("active")
    profileMiniCard?.setAttribute("aria-expanded", "false")
    document.getElementById("profileHeaderBtn")?.setAttribute("aria-expanded", "false")
}

export const openProfileDrawer = () => {
    const profileDrawer = document.getElementById("profileDrawer")
    const profileMiniCard = document.getElementById("profileMiniCard")
    closeSidebar()
    profileDrawer?.classList.add("is-open")
    profileDrawer?.setAttribute("aria-hidden", "false")
    profileMiniCard?.classList.add("active")
    profileMiniCard?.setAttribute("aria-expanded", "true")
    document.getElementById("profileHeaderBtn")?.setAttribute("aria-expanded", "true")
}

export const toggleProfileDrawer = () => {
    if (document.getElementById("profileDrawer")?.classList.contains("is-open")) {
        closeProfileDrawer()
    } else {
        openProfileDrawer()
    }
}

export const initProfile = () => {
    document.getElementById("profileMiniCard")?.addEventListener("click", toggleProfileDrawer)
    document.getElementById("profileBackdrop")?.addEventListener("click", closeProfileDrawer)
    document.getElementById("profileCloseBtn")?.addEventListener("click", closeProfileDrawer)

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && document.getElementById("profileDrawer")?.classList.contains("is-open")) {
            closeProfileDrawer()
        }
    })
}
