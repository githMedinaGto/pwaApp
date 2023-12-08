let cacheData = "appV1";
this.addEventListener("install", (event) =>{
    event.waitUntil(
        caches.open(cacheData).then((cache) => {
            return cache.addAll([
                '/',
                '/static/js/main.27b1a1a7.js',
                '/peli',
                '/user',
                '/comentarios',
                '/manifest.json',
                '/favicon.ico',
                '/logo192.png'
            ]).catch(error => {
                console.error('Error al almacenar en caché algunos recursos:', error);
            });
        })
    );
});

this.addEventListener("fetch", (event) =>{
    if(!navigator.onLine) {
        event.respondWith(
            caches.match(event.request).then((resp) => {
                if(resp) {
                    return resp;
                }
                let requestUrl = event.request.clone();
                return fetch(requestUrl).then(response => {
                    if(!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    let responseToCache = response.clone();
                    caches.open(cacheData).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                });
            }).catch(() => {
                return new Response("Internet no funciona", { status: 404, statusText: "Internet no funciona" });
            })
        );
    }
});
