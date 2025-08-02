const CACHE_NAME = "babounette-v1.0.0"
const STATIC_CACHE = "babounette-static-v1.0.0"
const DYNAMIC_CACHE = "babounette-dynamic-v1.0.0"

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/assistante",
  "/recettes",
  "/courses",
  "/calendrier",
  "/options",
  "/manifest.json",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11L-Clic_de_bouton_girly-1754003907888-JLmi4woLnORJ8q2N7JzYlWZDfsP6Tv.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/girlyclick-m35wgd6n66cyCgXLprXDMXMNnmyAQY.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fairyclick-hndPdZFszE6Klei4r4ySyWDfckMVR2.mp3",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Ressources critiques pour le fonctionnement hors ligne
const CRITICAL_ASSETS = ["/", "/dashboard", "/manifest.json"]

// Installation du Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installation en cours...")

  event.waitUntil(
    Promise.all([
      // Cache statique
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          console.log("Service Worker: Mise en cache des ressources statiques")
          return cache.addAll(STATIC_ASSETS)
        }),
      // Cache critique
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          console.log("Service Worker: Mise en cache des ressources critiques")
          return cache.addAll(CRITICAL_ASSETS)
        }),
    ]).then(() => {
      console.log("Service Worker: Installation terminée")
      // Forcer l'activation immédiate
      return self.skipWaiting()
    }),
  )
})

// Activation du Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activation en cours...")

  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                console.log("Service Worker: Suppression du cache obsolète:", cacheName)
                return caches.delete(cacheName)
              }
            }),
          )
        }),
      // Prendre le contrôle de tous les clients
      self.clients.claim(),
    ]).then(() => {
      console.log("Service Worker: Activation terminée")
      // Notifier les clients qu'une mise à jour est disponible
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SW_ACTIVATED" })
        })
      })
    }),
  )
})

// Stratégie de cache pour les requêtes
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith("http")) return

  // Stratégie Cache First pour les ressources statiques
  if (
    STATIC_ASSETS.some((asset) => url.pathname === asset) ||
    request.destination === "image" ||
    request.destination === "audio" ||
    request.destination === "font" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/sounds/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            // Mettre en cache la nouvelle ressource
            if (response.status === 200) {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
          .catch(() => {
            // Fallback pour les images
            if (request.destination === "image") {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#fdf2f8"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#ec4899" font-family="Arial" font-size="16">Image non disponible</text></svg>',
                { headers: { "Content-Type": "image/svg+xml" } },
              )
            }
          })
      }),
    )
    return
  }

  // Stratégie Network First pour les pages et API
  if (request.mode === "navigate" || url.pathname.startsWith("/api/") || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache les pages réussies
          if (response.status === 200 && request.mode === "navigate") {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback vers le cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }

            // Fallback vers la page d'accueil pour les navigations
            if (request.mode === "navigate") {
              return caches.match("/") || caches.match("/dashboard")
            }

            // Page d'erreur générique
            return new Response(
              `<!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Hors ligne - Babounette</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px; 
                  background: linear-gradient(135deg, #fdf2f8, #fce7f3);
                  color: #be185d;
                }
                .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
                h1 { color: #ec4899; margin-bottom: 1rem; }
                p { margin-bottom: 2rem; }
                button { 
                  background: linear-gradient(135deg, #ec4899, #f43f5e);
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 25px;
                  cursor: pointer;
                  font-size: 1rem;
                }
                button:hover { opacity: 0.9; }
              </style>
            </head>
            <body>
              <div class="offline-icon">💖</div>
              <h1>Tu es hors ligne</h1>
              <p>Babounette n'est pas disponible pour le moment.<br>Vérifie ta connexion internet !</p>
              <button onclick="window.location.reload()">Réessayer</button>
            </body>
            </html>`,
              {
                headers: {
                  "Content-Type": "text/html",
                  "Cache-Control": "no-cache",
                },
              },
            )
          })
        }),
    )
    return
  }

  // Stratégie par défaut : Network First avec fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
      }),
  )
})

// Gestion des messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Synchronisation en arrière-plan
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Synchronisation en arrière-plan:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Ici on pourrait synchroniser les données locales avec le serveur
      Promise.resolve().then(() => {
        console.log("Service Worker: Synchronisation terminée")
      }),
    )
  }
})

// Notifications push (pour plus tard)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    event.waitUntil(
      self.registration.showNotification(data.title || "Babounette", {
        body: data.body || "Tu as une nouvelle notification !",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "babounette-notification",
        requireInteraction: false,
        actions: [
          {
            action: "open",
            title: "Ouvrir",
            icon: "/icons/icon-72x72.png",
          },
          {
            action: "close",
            title: "Fermer",
          },
        ],
      }),
    )
  }
})

// Gestion des clics sur les notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow("/"))
  }
})

// Mise à jour automatique du cache
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "cache-update") {
    event.waitUntil(updateCache())
  }
})

// Fonction utilitaire pour mettre à jour le cache
async function updateCache() {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const requests = STATIC_ASSETS.map((url) => new Request(url))

    await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await fetch(request)
          if (response.status === 200) {
            await cache.put(request, response)
          }
        } catch (error) {
          console.warn("Impossible de mettre à jour:", request.url)
        }
      }),
    )

    console.log("Service Worker: Cache mis à jour")
  } catch (error) {
    console.error("Service Worker: Erreur lors de la mise à jour du cache:", error)
  }
}
