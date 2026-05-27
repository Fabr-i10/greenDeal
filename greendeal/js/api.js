export const urlAPI = "http://localhost:9002/graphql"
export const urlLogin = "http://localhost:9002/login"

export const getAuth = () => {
    const token = sessionStorage.getItem("access_token")
    return token ? `Bearer ${token}` : ""
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
    const result = await fetch(urlAPI, options)
    return await result.json()
}
