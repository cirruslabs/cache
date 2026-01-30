function normalizeCacheURL(address) {
    if (!address) {
        return "";
    }

    let url = "http://" + address;

    if (!url.endsWith("/")) {
        url += "/";
    }

    return url;
}

async function tryOverrideCache() {
    // Prefer omni-cache when available
    const omniCacheAddress = process.env["OMNI_CACHE_ADDRESS"];

    if (omniCacheAddress) {
        const httpCacheURL = normalizeCacheURL(omniCacheAddress);

        console.log("Redefining the ACTIONS_CACHE_URL and ACTIONS_RESULTS_URL to " + httpCacheURL + " to make the cache faster...");

        process.env["ACTIONS_CACHE_URL"] = httpCacheURL;
        process.env["ACTIONS_RESULTS_URL"] = httpCacheURL;

        return;
    }

    // Try Cirrus Runners region-local cache servers
    const httpCacheHost = process.env["CIRRUS_HTTP_CACHE_HOST"];

    if (httpCacheHost) {
        const httpCacheURL = normalizeCacheURL(httpCacheHost);

        console.log("Redefining the ACTIONS_CACHE_URL and ACTIONS_RESULTS_URL to " + httpCacheURL + " to make the cache faster...");

        process.env["ACTIONS_CACHE_URL"] = httpCacheURL;
        process.env["ACTIONS_RESULTS_URL"] = httpCacheURL;
    }

    // Do not change anything, thus falling back to GitHub-provided cache servers
}

await tryOverrideCache();

import("./index.js")
