import { urlWS } from "./api.js"

let activeCallback = null
let reconnectTimer = null
let currentSocket = null
let reconnectAttempts = 0
const MAX_RECONNECT = 3

const connect = () => {
    if (!window.WebSocket || !navigator.onLine || !activeCallback) return null
    if (reconnectAttempts >= MAX_RECONNECT) return null

    currentSocket = new WebSocket(urlWS, "graphql-transport-ws")

    currentSocket.onerror = () => {}

    currentSocket.onopen = () => {
        reconnectAttempts = 0
        currentSocket.send(
            JSON.stringify({
                type: "connection_init",
                payload: {
                    accessToken: sessionStorage.getItem("access_token") || "",
                },
            })
        )
    }

    currentSocket.onclose = () => {
        currentSocket = null
        if (!navigator.onLine || !activeCallback || reconnectAttempts >= MAX_RECONNECT) return
        reconnectAttempts += 1
        reconnectTimer = setTimeout(connect, 5000)
    }

    currentSocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "connection_ack") {
            reconnectAttempts = 0
            currentSocket.send(
                JSON.stringify({
                    id: "1",
                    type: "subscribe",
                    payload: {
                        query: `subscription {
                            newSale {
                                saleDate
                                quantityPeople
                                totalSale
                                tour {
                                    tourName
                                }
                            }
                        }`,
                    },
                })
            )
        } else if (data.type === "connection_error" || data.type === "error") {
            reconnectAttempts = MAX_RECONNECT
            currentSocket.close()
        } else if (data.type === "next") {
            const sale = data.payload?.data?.newSale
            if (sale) activeCallback(sale)
        }
    }

    return currentSocket
}

export const newSaleSubscription = (onNewSale) => {
    activeCallback = onNewSale
    reconnectAttempts = 0
    closeSubscription(false)
    return connect()
}

export const closeSubscription = (clearCallback = true) => {
    if (clearCallback) activeCallback = null
    clearTimeout(reconnectTimer)
    reconnectTimer = null
    reconnectAttempts = 0
    currentSocket?.close()
    currentSocket = null
}
