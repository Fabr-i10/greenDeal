import { getFriendlyMessage } from "./errors.js"

export const urlAPI = "https://greendeal-0ash.onrender.com/graphql"
export const urlLogin = "https://greendeal-0ash.onrender.com/login"
export const urlWS = "wss://greendeal-0ash.onrender.com/graphql"

let offlineBannerShown = false

export const getAuth = () => {
    const token = sessionStorage.getItem("access_token")
    return token ? `Bearer ${token}` : ""
}

const notifyOfflineMode = (fromCache = false) => {
    if (offlineBannerShown) return
    offlineBannerShown = true
    import("../shared/js/alerts.js").then(({ showAppAlert }) => {
        showAppAlert(
            fromCache
                ? "Sin conexión: mostrando datos guardados en caché."
                : "Sin conexión: los cambios se guardarán y sincronizarán al reconectar.",
            "warning"
        )
    })
}

export const fetchAPI = async (query, variables = {}) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: getAuth(),
        },
        body: JSON.stringify({ query, variables }),
    }

    let result
    try {
        result = await fetch(urlAPI, options)
    } catch {
        const cached = sessionStorage.getItem("user")
        if (cached && query.includes("me")) {
            return { data: { me: JSON.parse(cached) }, offline: true }
        }
        throw new Error(getFriendlyMessage("Failed to fetch", "Sin conexión con el servidor"))
    }

    const data = await result.json()

    if (data.offline) {
        notifyOfflineMode(query.trim().startsWith("query"))
    }

    return data
}

export const resetOfflineBanner = () => {
    offlineBannerShown = false
}
