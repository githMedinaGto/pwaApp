let cacheData = "appV1";
this.addEventListener("install", (event) =>{
    event.waitUntil(
        caches.open(cacheData).then((cache) => {
            cache.addAll([
                '/',
                '/static/js/main.27b1a1a7.js',
                '/peli',
                '/user',
                '/comentarios',
                '/manifest.json',
                '/favicon.ico',
                '/logo192.png'
            ])
        })
    )
})


this.addEventListener("fetch", (event) =>{

    if(!navigator.onLine)
    {
        if(event.request.url==="http://localhost:3000/static/js/bundle.js"){
            event.waitUntil(
                this.registration.showNotification("Internet",{
                    body:"Internet not working",
                })
            )
        }
        
        event.respondWith(
        caches.match(event.request).then((resp) =>{
            if(resp){
                return resp;
            }
            let requestUrl = event.request.clone();
            console.log(requestUrl);
            fetch(requestUrl)
        })
        )
    }
} )

/*
this.addEventListener("fetch", (event) => {
    if (!navigator.onLine) {
        event.respondWith(
            caches.match(event.request).then((resp) => {
                if (resp) {
                    return resp;
                } else {
                    return new Response("Internet not working", { status: 404, statusText: "Internet not working" });
                }
            }).catch(() => {
                return new Response("Internet not working", { status: 404, statusText: "Internet not working" });
            })
        );
    }
});*/
