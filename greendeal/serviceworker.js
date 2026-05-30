/** CICLO DE VIDA
 * Etapas
 * 1- Instalacion
 * 2- Espera de activacion
 * 3- Activo -> fetch/sync/push
 */

const CACHE_STATIC_NAME = "greendeal-static-v6"
const CACHE_DYNAMIC_NAME = "greendeal-dynamic-v6"
const CACHE_GRAPHQL_NAME = "greendeal-graphql-v6"
const CACHE_IMMUTABLE_NAME = "greendeal-immutable-v6"
const MAX_CACHE_ITEMS = 50
const GRAPHQL_URL = "https://greendeal-0ash.onrender.com/graphql"
const BASE = new URL("./", self.location.href)

importScripts("https://cdnjs.cloudflare.com/ajax/libs/pouchdb/9.0.0/pouchdb.min.js")
// offlinesync.js va inline (importScripts falla sin red al reiniciar el SW)

function assetUrl(path) {
    return new URL(path.replace(/^\//, ""), BASE).href
}

function graphqlCacheKey(key) {
    return `${GRAPHQL_URL.replace(/\/graphql$/, "")}/.greendeal-cache/${key}`
}

const STATIC_PATHS = [
    "index.html",
    "serviceworker.js",
    "shared/css/variables.css",
    "shared/css/base.css",
    "shared/css/layout.css",
    "shared/css/components.css",
    "features/auth/auth.css",
    "features/dashboard/dashboard.css",
    "features/reports/reports.css",
    "shared/js/app.js",
    "shared/js/load-partials.js",
    "shared/js/alerts.js",
    "shared/js/utils.js",
    "shared/js/confirm.js",
    "shared/js/sidebar.js",
    "shared/js/profile.js",
    "shared/js/router.js",
    "shared/js/session.js",
    "features/auth/auth.js",
    "features/auth/auth.html",
    "features/dashboard/dashboard.html",
    "features/providers/providers.js",
    "features/providers/providers.html",
    "features/providers/providers-form.html",
    "features/tours/tours.js",
    "features/tours/tours.html",
    "features/tours/tours-form.html",
    "features/sales/sales.js",
    "features/sales/sales.html",
    "features/sales/sales-form.html",
    "features/reports/reports.js",
    "features/reports/reports.html",
    "shared/sidebar.html",
    "shared/profile-drawer.html",
    "shared/confirm-form.html",
    "js/api.js",
    "js/authservice.js",
    "js/wsservice.js",
    "js/offlinesync.js",
    "js/providerservice.js",
    "js/tourservice.js",
    "js/salesservice.js",
    "js/reportservice.js",
    "manifest.json",
    "img/icon_x192.png",
    "img/icon_x96.png",
    "img/icon_x48.png",
    "img/icon_x72.png",
]

const STATIC_ASSETS = [BASE.href, assetUrl("index.html"), ...STATIC_PATHS.map(assetUrl)]

const IMMUTABLE_ASSETS = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css",
    "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pouchdb/9.0.0/pouchdb.min.js",
]


// --- offlinesync.js (inline) ---
const db = new PouchDB("greendeal_offline")

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
        JSON.stringify({ data: { [mutationName]: payload }, offline: true }),
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
        new Response(JSON.stringify(next), { headers: { "Content-Type": "application/json" } })
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
    for (const row of docs.rows) {
        const doc = row.doc
        try {
            const result = await syncFetchAPI(doc.query, doc.variables || {}, doc.auth)
            if (result.errors?.length) {
                console.warn("[Sync] Error:", result.errors[0]?.message)
                continue
            }
            await db.remove(doc)
            console.log("[Sync] OK:", extractMutationName(doc.query))
        } catch (err) {
            console.warn("[Sync] Falló:", err)
        }
    }
}

async function syncFetchAPI(query, variables = {}, auth = "") {
    const result = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: auth ? `Bearer ${auth}` : "",
        },
        body: JSON.stringify({ query, variables }),
    })
    return await result.json()
}

self.addEventListener("online", () => {
    syncOnline().catch((err) => console.warn("Error al sincronizar:", err))
})
// --- fin offlinesync ---

function isGraphQLRequest(request) {
    return request.method === "POST" && request.url.startsWith(GRAPHQL_URL)
}

function getQueryCacheKey(query = "") {
    const q = query.replace(/\s+/g, " ")
    if (/query\s+me\b/i.test(q)) return "me"
    if (/query\s+providers\b/i.test(q)) return "providers"
    if (/query\s+tours\b/i.test(q)) return "tours"
    if (/query\s+sales\b/i.test(q)) return "sales"
    return null
}

function emptyGraphQLResponse() {
    return new Response(JSON.stringify({ data: null, offline: true }), {
        headers: { "Content-Type": "application/json" },
    })
}

async function cacheGraphQLData(data) {
    const cacheKey = ["providers", "tours", "sales", "me"].find((key) => data.data?.[key])
    if (!cacheKey) return

    const cache = await caches.open(CACHE_GRAPHQL_NAME)
    await cache.put(
        graphqlCacheKey(cacheKey),
        new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
    )
}

async function serveOfflineGraphQL(bodyData) {
    if (bodyData.query.includes("mutation")) return null

    const cacheKey = getQueryCacheKey(bodyData.query)
    if (!cacheKey) return emptyGraphQLResponse()

    const cache = await caches.open(CACHE_GRAPHQL_NAME)
    const cached = await cache.match(graphqlCacheKey(cacheKey))
    if (!cached) return emptyGraphQLResponse()

    const body = await cached.json()
    return new Response(JSON.stringify({ ...body, offline: true }), {
        headers: { "Content-Type": "application/json" },
    })
}

async function handleGraphQL(request) {
    const bodyText = await request.clone().text()
    const bodyData = JSON.parse(bodyText)
    const authHeader = request.headers.get("Authorization") || ""
    const token = authHeader.replace("Bearer ", "")

    if (bodyData.query.includes("mutation")) {
        if (self.navigator.onLine) {
            try {
                const resp = await fetch(request.clone())
                if (resp.ok) return resp
            } catch {
                /* offline fallback */
            }
        }
        return saveOnLocal(bodyData, token)
    }

    if (!self.navigator.onLine) {
        return serveOfflineGraphQL(bodyData)
    }

    try {
        const resp = await fetch(request.clone())
        if (resp.ok) {
            const data = await resp.clone().json()
            await cacheGraphQLData(data)
        }
        return resp
    } catch {
        const offline = await serveOfflineGraphQL(bodyData)
        return offline || emptyGraphQLResponse()
    }
}

async function cacheMany(cache, urls) {
    await Promise.all(
        urls.map(async (url) => {
            try {
                await cache.add(url)
            } catch (err) {
                console.warn("No cacheado:", url)
            }
        })
    )
}

async function matchFromCaches(request) {
    return (
        (await caches.match(request)) ||
        (await caches.match(request, { cacheName: CACHE_STATIC_NAME })) ||
        (await caches.match(request, { cacheName: CACHE_IMMUTABLE_NAME })) ||
        (await caches.match(request, { cacheName: CACHE_DYNAMIC_NAME }))
    )
}

self.addEventListener("install", (event) => {
    console.log("Service Worker en proceso de instalacion")

    event.waitUntil(
        Promise.all([
            caches.open(CACHE_IMMUTABLE_NAME).then((cache) => cacheMany(cache, IMMUTABLE_ASSETS)),
            caches.open(CACHE_STATIC_NAME).then((cache) => cacheMany(cache, STATIC_ASSETS)),
        ]).then(() => {
            console.log("Instalacion completa")
            self.skipWaiting()
        })
    )
})

self.addEventListener("activate", (event) => {
    console.log("Service Worker activo")
    const validCaches = [CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME, CACHE_GRAPHQL_NAME, CACHE_IMMUTABLE_NAME]
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => !validCaches.includes(k)).map((k) => caches.delete(k)))
            )
            .then(() => self.clients.claim())
    )
})

function clearCache(cacheName, maxItems) {
    caches.open(cacheName).then((cache) => {
        cache.keys().then((keys) => {
            if (keys.length > maxItems) {
                cache.delete(keys[0]).then(() => clearCache(cacheName, maxItems))
            }
        })
    })
}

self.addEventListener("fetch", (event) => {
    if (isGraphQLRequest(event.request)) {
        event.respondWith(handleGraphQL(event.request))
        return
    }

    if (event.request.method !== "GET") return

    event.respondWith(
        (async () => {
            if (!self.navigator.onLine) {
                const cached = await matchFromCaches(event.request)
                if (cached) return cached
            }

            try {
                const res = await fetch(event.request)
                if (res.ok) {
                    const resClone = res.clone()
                    const cache = await caches.open(CACHE_DYNAMIC_NAME)
                    await cache.put(event.request, resClone)
                    clearCache(CACHE_DYNAMIC_NAME, MAX_CACHE_ITEMS)
                }
                return res
            } catch {
                const cached = await matchFromCaches(event.request)
                return cached || Response.error()
            }
        })()
    )
})

self.addEventListener("push", (event) => {
    console.log(event.data?.text())
})

self.addEventListener("sync", (event) => {
    if (event.tag === "new-mutation") {
        console.log("Sincronizando mutaciones pendientes...")
        event.waitUntil(syncOnline())
    }
})
