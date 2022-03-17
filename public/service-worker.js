
const CACHE_NAME = 'my-service-worker-cache'
const urlsToCache = ['/']

self.addEventListener('install',(e)=>{

  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );

})