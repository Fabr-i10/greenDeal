export const getUserInitials = (fullName) => {
    if (!fullName) return "--"
    return fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
}

export const formatProfileDate = (value) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return new Intl.DateTimeFormat("es-CR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date)
}

export const formatDate = (value) => {
    if (!value) return "-"
    const [year, month, day] = value.split("-")
    return `${day}/${month}/${year}`
}
