/** Referencia del módulo offline. La lógica activa está inline en serviceworker.js */
const urlAPI = "http://localhost:9002/graphql"
const CACHE_GRAPHQL_NAME = "greendeal-graphql-v6"

function graphqlCacheKey(key) {
    return `${urlAPI.replace(/\/graphql$/, "")}/.greendeal-cache/${key}`
}

function extractMutationName(query = "") {
    const match = query.match(/mutation\s+(?:\w+\s*)?\(?[^)]*\)?\s*\{\s*(\w+)/i)
    return match?.[1] || null
}

function buildOfflinePayload(data) {
    const mutationName = extractMutationName(data.query)
    const input = data.variables?.input || {}
    const id = `offline-${Date.now()}`

    const payloads = {
        createProvider: { id, ...input, createdAt: new Date().toISOString() },
        updateProvider: { id: data.variables?.id || id, ...input },
        createTour: {
            id,
            ...input,
            provider: { companyName: "Pendiente de sincronizar" },
            createdAt: new Date().toISOString(),
        },
        updateTour: { id: data.variables?.id || id, ...input },
        createSale: {
            id,
            saleDate: input.saleDate,
            quantityPeople: input.quantityPeople,
            totalSale: 0,
            commissionTotal: 0,
            commissionWithoutVAT: 0,
            vatAmount: 0,
            tour: { tourName: "Pendiente de sincronizar" },
            createdAt: new Date().toISOString(),
            offline: true,
        },
        deleteProvider: true,
        deleteTour: true,
        deleteSale: true,
    }

    return {
        mutationName,
        payload: Object.prototype.hasOwnProperty.call(payloads, mutationName)
            ? payloads[mutationName]
            : { id, offline: true },
    }
}

function buildOfflineMutationResponse(data) {
    const { mutationName, payload } = buildOfflinePayload(data)

    return new Response(
        JSON.stringify({
            data: { [mutationName]: payload },
            offline: true,
        }),
        { headers: { "Content-Type": "application/json" } }
    )
}

async function mutateCachedQuery(listKey, updater) {
    const cache = await caches.open(CACHE_GRAPHQL_NAME)
    const cached = await cache.match(graphqlCacheKey(listKey))
    if (!cached) return

    const body = await cached.json()
    const next = updater(body)
    if (!next) return

    await cache.put(
        graphqlCacheKey(listKey),
        new Response(JSON.stringify(next), {
            headers: { "Content-Type": "application/json" },
        })
    )
}

async function updateCacheAfterOfflineMutation(data) {
    const { mutationName, payload } = buildOfflinePayload(data)
    const id = data.variables?.id
    const input = data.variables?.input || {}

    if (mutationName === "createProvider") {
        await mutateCachedQuery("providers", (body) => {
            if (!body.data?.providers?.data) return null
            body.data.providers.data.unshift(payload)
            return body
        })
    } else if (mutationName === "updateProvider" && id) {
        await mutateCachedQuery("providers", (body) => {
            if (!body.data?.providers?.data) return null
            const index = body.data.providers.data.findIndex((item) => item.id === id)
            if (index >= 0) body.data.providers.data[index] = { ...body.data.providers.data[index], ...input }
            return body
        })
    } else if (mutationName === "deleteProvider" && id) {
        await mutateCachedQuery("providers", (body) => {
            if (!body.data?.providers?.data) return null
            body.data.providers.data = body.data.providers.data.filter((item) => item.id !== id)
            return body
        })
    } else if (mutationName === "createTour") {
        await mutateCachedQuery("tours", (body) => {
            if (!body.data?.tours?.data) return null
            body.data.tours.data.unshift(payload)
            return body
        })
    } else if (mutationName === "updateTour" && id) {
        await mutateCachedQuery("tours", (body) => {
            if (!body.data?.tours?.data) return null
            const index = body.data.tours.data.findIndex((item) => item.id === id)
            if (index >= 0) body.data.tours.data[index] = { ...body.data.tours.data[index], ...input }
            return body
        })
    } else if (mutationName === "deleteTour" && id) {
        await mutateCachedQuery("tours", (body) => {
            if (!body.data?.tours?.data) return null
            body.data.tours.data = body.data.tours.data.filter((item) => item.id !== id)
            return body
        })
    } else if (mutationName === "createSale") {
        await mutateCachedQuery("sales", (body) => {
            if (!body.data?.sales?.data) return null
            body.data.sales.data.unshift(payload)
            return body
        })
    } else if (mutationName === "deleteSale" && id) {
        await mutateCachedQuery("sales", (body) => {
            if (!body.data?.sales?.data) return null
            body.data.sales.data = body.data.sales.data.filter((item) => item.id !== id)
            return body
        })
    }
}

async function saveOnLocal(data, auth) {
    data._id = new Date().toISOString()
    data.auth = auth
    await db.put(data)
    await updateCacheAfterOfflineMutation(data)

    if ("sync" in self.registration) {
        await self.registration.sync.register("new-mutation").catch(() => {})
    }

    return buildOfflineMutationResponse(data)
}

async function syncOnline() {
    const docs = await db.allDocs({ include_docs: true })
    const pending = docs.rows.map((row) => row.doc)

    for (const doc of pending) {
        try {
            const result = await fetchAPI(doc.query, doc.variables || {}, doc.auth)
            if (result.errors?.length) {
                console.warn("[Sync] Error en mutación pendiente:", result.errors[0]?.message)
                continue
            }
            await db.remove(doc)
            console.log("[Sync] Mutación sincronizada:", extractMutationName(doc.query))
        } catch (err) {
            console.warn("[Sync] No se pudo sincronizar mutación:", err)
        }
    }
}

const fetchAPI = async (query, variables = {}, auth = "") => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: auth ? `Bearer ${auth}` : "",
        },
        body: JSON.stringify({ query, variables }),
    }
    const result = await fetch(urlAPI, options)
    return await result.json()
}

self.addEventListener("online", () => {
    syncOnline().catch((err) => console.warn("Error al sincronizar:", err))
})
