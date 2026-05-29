const TECHNICAL_PATTERNS = [
    [/Cannot read properties of null/i, "No se recibieron datos del servidor."],
    [/Cannot read properties of undefined/i, "No se recibieron datos del servidor."],
    [/FOREIGN KEY constraint failed/i, "No se puede eliminar porque tiene registros relacionados."],
    [/SQLITE_CONSTRAINT/i, "Operación no permitida por registros relacionados."],
    [/Failed to fetch/i, "Sin conexión con el servidor."],
    [/NetworkError/i, "Sin conexión con el servidor."],
    [/Unexpected token/i, "Respuesta inválida del servidor."],
]

export function getFriendlyMessage(source, fallback = "Ocurrió un error inesperado.") {
    if (!source) return fallback

    const message =
        typeof source === "string"
            ? source
            : source?.message || source?.errors?.[0]?.message || ""

    if (!message) return fallback

    for (const [pattern, friendly] of TECHNICAL_PATTERNS) {
        if (pattern.test(message)) return friendly
    }

    if (/^[A-Z_]+$/.test(message)) {
        const codes = {
            PROVIDER_HAS_TOURS:
                "No puedes eliminar este proveedor porque tiene tours asociados. Elimina primero los tours.",
            TOUR_HAS_SALES:
                "No puedes eliminar este tour porque tiene ventas registradas. Elimina primero las ventas.",
            PROVIDER_NOT_FOUND: "El proveedor seleccionado no existe.",
            TOUR_NOT_FOUND: "El tour seleccionado no existe.",
            EMAIL_EXISTS: "El correo ya está registrado.",
            INVALID_QUANTITY: "La cantidad de personas debe ser mayor a cero.",
        }
        if (codes[message]) return codes[message]
    }

    return message
}

export function assertGraphQL(data, fallback) {
    if (data?.errors?.length) {
        throw new Error(getFriendlyMessage(data.errors[0], fallback))
    }
}

export function getGraphQLList(data, field, offlineMessage, fallback) {
    assertGraphQL(data, fallback)
    const list = data?.data?.[field]?.data
    if (Array.isArray(list)) return list
    if (data?.offline) throw new Error(offlineMessage)
    throw new Error(fallback)
}

export function getGraphQLField(data, field, { offlineMessage, fallback }) {
    assertGraphQL(data, fallback)
    const value = data?.data?.[field]
    if (value != null) return value
    if (data?.offline && offlineMessage) throw new Error(offlineMessage)
    throw new Error(fallback)
}

export function getGraphQLMutation(data, field, fallback) {
    assertGraphQL(data, fallback)
    if (data?.data?.[field] == null) throw new Error(fallback)
    return data.data[field]
}
