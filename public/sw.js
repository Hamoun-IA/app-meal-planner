// =============================================================================
// SERVICE WORKER - ASSISTANTE BABOUNETTE
// =============================================================================

const CACHE_NAME = "babounette-v1.0.0";
const STATIC_CACHE = "babounette-static-v1.0.0";
const DYNAMIC_CACHE = "babounette-dynamic-v1.0.0";

// URLs à mettre en cache immédiatement
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/favicon.ico",
  "/offline.html",
];

// Stratégies de cache
const CACHE_STRATEGIES = {
  // Cache First pour les assets statiques
  STATIC: "cache-first",
  // Network First pour les données dynamiques
  DYNAMIC: "network-first",
  // Stale While Revalidate pour les API
  API: "stale-while-revalidate",
};

// =============================================================================
// INSTALLATION DU SERVICE WORKER
// =============================================================================

self.addEventListener("install", (event) => {
  console.log("[SW] Installation du service worker");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Mise en cache des assets statiques");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Service worker installé avec succès");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Erreur lors de l'installation:", error);
      })
  );
});

// =============================================================================
// ACTIVATION DU SERVICE WORKER
// =============================================================================

self.addEventListener("activate", (event) => {
  console.log("[SW] Activation du service worker");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Suppression de l'ancien cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Service worker activé");
        return self.clients.claim();
      })
  );
});

// =============================================================================
// INTERCEPTION DES REQUÊTES
// =============================================================================

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== "GET") {
    return;
  }

  // Ignorer les requêtes de développement
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return;
  }

  // Déterminer la stratégie de cache selon le type de ressource
  const strategy = getCacheStrategy(url);

  event.respondWith(
    handleRequest(request, strategy).catch((error) => {
      console.error("[SW] Erreur lors de la gestion de la requête:", error);
      return handleOfflineFallback(request);
    })
  );
});

// =============================================================================
// STRATÉGIES DE CACHE
// =============================================================================

function getCacheStrategy(url) {
  // Assets statiques (CSS, JS, images, fonts)
  if (
    url.pathname.match(
      /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/
    )
  ) {
    return CACHE_STRATEGIES.STATIC;
  }

  // API routes
  if (url.pathname.startsWith("/api/")) {
    return CACHE_STRATEGIES.API;
  }

  // Pages et données dynamiques
  return CACHE_STRATEGIES.DYNAMIC;
}

async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.STATIC:
      return cacheFirst(request);
    case CACHE_STRATEGIES.DYNAMIC:
      return networkFirst(request);
    case CACHE_STRATEGIES.API:
      return staleWhileRevalidate(request);
    default:
      return networkFirst(request);
  }
}

// Cache First - Pour les assets statiques
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("[SW] Erreur réseau pour cache-first:", error);
    throw error;
  }
}

// Network First - Pour les données dynamiques
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("[SW] Hors ligne, utilisation du cache pour:", request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Stale While Revalidate - Pour les API
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error("[SW] Erreur réseau pour stale-while-revalidate:", error);
      return cachedResponse;
    });

  return cachedResponse || fetchPromise;
}

// =============================================================================
// GESTION HORS LIGNE
// =============================================================================

async function handleOfflineFallback(request) {
  const url = new URL(request.url);

  // Page hors ligne personnalisée
  if (request.destination === "document") {
    const offlineResponse = await caches.match("/offline.html");
    if (offlineResponse) {
      return offlineResponse;
    }
  }

  // Image de fallback
  if (request.destination === "image") {
    const fallbackImage = await caches.match("/placeholder.svg");
    if (fallbackImage) {
      return fallbackImage;
    }
  }

  // Réponse d'erreur générique
  return new Response(
    JSON.stringify({
      error: "Hors ligne",
      message: "Cette ressource n'est pas disponible hors ligne",
    }),
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// =============================================================================
// SYNCHRONISATION EN ARRIÈRE-PLAN
// =============================================================================

self.addEventListener("sync", (event) => {
  console.log("[SW] Synchronisation en arrière-plan:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  try {
    // Synchroniser les données en attente
    console.log("[SW] Synchronisation des données en arrière-plan");

    // Ici, on pourrait synchroniser les recettes, paramètres, etc.
    // qui ont été modifiés hors ligne
  } catch (error) {
    console.error("[SW] Erreur lors de la synchronisation:", error);
  }
}

// =============================================================================
// NOTIFICATIONS PUSH
// =============================================================================

self.addEventListener("push", (event) => {
  console.log("[SW] Notification push reçue");

  const options = {
    body: event.data
      ? event.data.text()
      : "Nouvelle notification de Babounette",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Voir",
        icon: "/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "Fermer",
        icon: "/icons/icon-72x72.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Assistante Babounette", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Clic sur notification:", event.action);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// =============================================================================
// MESSAGE DU SERVICE WORKER
// =============================================================================

self.addEventListener("message", (event) => {
  console.log("[SW] Message reçu:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
