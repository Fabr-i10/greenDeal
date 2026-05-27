const CACHE_NAME = "greendeal-v31"
const ASSETS = [
    "/",
    "/index.html",
    "/shared/css/variables.css",
    "/shared/css/base.css",
    "/shared/css/layout.css",
    "/shared/css/components.css",
    "/features/auth/auth.css",
    "/features/dashboard/dashboard.css",
    "/features/reports/reports.css",
    "/shared/js/app.js",
    "/shared/js/load-partials.js",
    "/shared/js/alerts.js",
    "/shared/js/utils.js",
    "/shared/js/confirm.js",
    "/shared/js/sidebar.js",
    "/shared/js/profile.js",
    "/shared/js/router.js",
    "/shared/js/session.js",
    "/features/auth/auth.js",
    "/features/auth/auth.html",
    "/features/dashboard/dashboard.html",
    "/features/providers/providers.js",
    "/features/providers/providers.html",
    "/features/providers/providers-form.html",
    "/features/tours/tours.js",
    "/features/tours/tours.html",
    "/features/tours/tours-form.html",
    "/features/sales/sales.js",
    "/features/sales/sales.html",
    "/features/sales/sales-form.html",
    "/features/reports/reports.js",
    "/features/reports/reports.html",
    "/shared/sidebar.html",
    "/shared/profile-drawer.html",
    "/shared/confirm-form.html",
    "/js/api.js",
    "/js/authservice.js",
    "/js/providerservice.js",
    "/js/tourservice.js",
    "/js/salesservice.js",
    "/js/reportservice.js",
    "/manifest.json",
    "/img/icon_x192.png",
]

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)))
})

self.addEventListener("fetch", (event) => {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)))
})
