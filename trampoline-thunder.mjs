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

async function redefine(httpCacheHost, speed, locality) {
    const httpCacheURL = normalizeCacheURL(httpCacheHost);

    console.log("Redefining the ACTIONS_CACHE_URL and ACTIONS_RESULTS_URL to " + httpCacheURL + " to make cache " + speed + " using " + locality + " cache servers...");

    process.env["ACTIONS_CACHE_URL"] = httpCacheURL;
    process.env["ACTIONS_RESULTS_URL"] = httpCacheURL;
}

async function tryOverrideCache() {
    // Prefer omni-cache when available
    const omniCacheAddress = process.env["OMNI_CACHE_ADDRESS"];

    if (omniCacheAddress) {
        await redefine(omniCacheAddress, "faster", "omni-cache");

        return;
    }

    // Try Cirrus Runners zone-local cache servers
    const httpCacheHostThunder = process.env["CIRRUS_HTTP_CACHE_HOST_THUNDER"];

    if (httpCacheHostThunder) {
        await redefine(httpCacheHostThunder, "super-fast", "zone-local");

        return;
    }

    // Try Cirrus Runners region-local cache servers
    const httpCacheHost = process.env["CIRRUS_HTTP_CACHE_HOST"];

    if (httpCacheHost) {
        await redefine(httpCacheHost, "faster", "region-local");
    }

    // Do not change anything, thus falling back to GitHub-provided cache servers
}

await tryOverrideCache();

import("./index.js")
