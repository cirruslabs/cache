async function redefine(httpCacheHost) {
    const httpCacheURL = "http://" + httpCacheHost + "/";

    console.log("Redefining the ACTIONS_CACHE_URL and ACTIONS_RESULTS_URL to " + httpCacheURL + " to make the cache faster...");

    process.env["ACTIONS_CACHE_URL"] = httpCacheURL;
    process.env["ACTIONS_RESULTS_URL"] = httpCacheURL;
}

async function tryOverrideCache() {
    // Try Cirrus Runners zone-local cache servers
    const httpCacheHostThunder = process.env["CIRRUS_HTTP_CACHE_HOST_THUNDER"];

    if (httpCacheHostThunder) {
        await redefine(httpCacheHostThunder);

        return;
    }

    // Try Cirrus Runners region-local cache servers
    const httpCacheHost = process.env["CIRRUS_HTTP_CACHE_HOST"];

    if (httpCacheHost) {
        await redefine(httpCacheHost);
    }

    // Do not change anything, thus falling back to GitHub-provided cache servers
}

await tryOverrideCache();

import("./index.js")
