var CACHE_NAME = "budget-cache";
const DATA_CACHE_NAME = "budget-data-cache";

var urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

//event listener to go through install process
self.addEventListener("install", function (event) {
  //wait until db opens
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Cache Ready");
      // return cache
      return cache.addAll(urlsToCache);
    })
  );
});

//event listener to fetch cache
self.addEventListener("fetch", function (event) {
  // if api request ..
  if (event.request.url.includes("/api/")) {
    // respond with cache
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        // return with fetch
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  event.respondWith(
    // return cached root page
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
