async function tryConfigureChacha(chachaURL) {
    console.log("Cirrus Runners's Chacha zone-local cache servers found, proceeding...");

    const tokenRequestURL = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
    const tokenRequestToken = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];

    if (!tokenRequestURL || !tokenRequestToken) {
        console.log("Cirrus Runners's Chacha zone-local cache servers are available, " +
            "but seems like no \"id-token: write\" permission is configured, " +
            "falling back to Cirrus Runners regional servers...");

        return false;
    }

    try {
        const resp = await fetch(tokenRequestURL, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + tokenRequestToken,
            }
        });

        const result = await resp.json();

        process.env["ACTIONS_CACHE_URL"] = chachaURL;
        process.env["ACTIONS_RUNTIME_TOKEN"] = result.value;

        return true;
    } catch (e) {
        console.log("Failed to retrieve OIDC token, " +
            "falling back to Cirrus Runners regional servers...");
    }
}

async function tryOverrideCache() {
    // Try Cirrus Runners's Chacha zone-local cache servers first
    const chachaURL = process.env["CIRRUS_CHACHA_URL"];

    if (chachaURL && await tryConfigureChacha(chachaURL)) {
        return;
    }

    // Fall back to Cirrus Runners regional-local cache servers
    console.log("Falling back to Cirrus Runners regional-local cache servers...");

    const httpCacheHost = process.env["CIRRUS_HTTP_CACHE_HOST"];

    if (httpCacheHost) {
        const newActionsCacheURL = "http://" + httpCacheHost + "/";

        console.log("Redefining the ACTIONS_CACHE_URL to " + newActionsCacheURL + " to make the cache faster...");

        process.env["ACTIONS_CACHE_URL"] = newActionsCacheURL;
    }

    // Do not change anything, thus falling back to GitHub-provided cache servers
}

await tryOverrideCache();

import("./index.js")
