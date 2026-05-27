export async function loadHtml(targetSelector, url) {
    const target = document.querySelector(targetSelector)
    if (!target) throw new Error(`No se encontró ${targetSelector}`)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`No se pudo cargar ${url}`)
    target.insertAdjacentHTML("beforeend", await response.text())
}

export async function loadPartials() {
    await loadHtml("#authSection", "features/auth/auth.html")
    await loadHtml("#sidebar-root", "shared/sidebar.html")
    await loadHtml("#profile-root", "shared/profile-drawer.html")

    for (const view of ["dashboard", "providers", "tours", "sales", "reports"]) {
        await loadHtml("#views-root", `features/${view}/${view}.html`)
    }

    await loadHtml("#forms-root", "features/providers/providers-form.html")
    await loadHtml("#forms-root", "features/tours/tours-form.html")
    await loadHtml("#forms-root", "features/sales/sales-form.html")
    await loadHtml("#forms-root", "shared/confirm-form.html")
}
