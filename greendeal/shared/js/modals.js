/** Cierra modales abiertos y limpia backdrop (evita pantalla congelada al cambiar de sección). */
export const dismissOpenModals = () => {
    document.querySelectorAll(".modal.show").forEach((modalEl) => {
        const instance = bootstrap.Modal.getInstance(modalEl)
        if (instance) {
            instance.hide()
        }
    })

    document.querySelectorAll(".modal").forEach((modalEl) => {
        modalEl.classList.remove("show")
        modalEl.setAttribute("aria-hidden", "true")
        modalEl.removeAttribute("aria-modal")
        modalEl.style.display = "none"
    })

    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.remove())
    document.body.classList.remove("modal-open")
    document.body.style.removeProperty("overflow")
    document.body.style.removeProperty("padding-right")
}
