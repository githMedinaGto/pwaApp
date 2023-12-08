let cacheData = "appV1";
this.addEventListener("install", (event) =>{
    event.waitUntil(
        caches.open(cacheData).then((cache) => {
            cache.addAll([
                '/',
                '/index.html',
                'About.js'
            ])
        })
    )
})


this.addEventListener("fetch", (event) =>{

    if(!navigator.onLine)
    {
        if(event.request.url==="https://pwa-cine-mania.netlify.app/static/js/bundle.js"){
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
