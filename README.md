# Cirrus Cache action

This utility repository periodically runs a GitHub Action that pulls the latest [actions/cache](https://github.com/actions/cache) repository and applies a rather simple patch to all of its actions:

```ts
const omniCacheAddress = process.env["OMNI_CACHE_ADDRESS"];
const httpCacheHost = process.env["CIRRUS_HTTP_CACHE_HOST"];
const cacheAddress = omniCacheAddress ?? httpCacheHost;

if (cacheAddress != null) {
    const newActionsCacheURL = `http://${cacheAddress}/`;

    console.log(
        `Redefining the ACTIONS_CACHE_URL to ${newActionsCacheURL} to make the cache faster...`
    );

    process.env["ACTIONS_CACHE_URL"] = newActionsCacheURL;
    process.env["ACTIONS_RESULTS_URL"] = newActionsCacheURL;
}
```

This allows jobs on [Cirrus Runners](https://cirrus-runners.app/) or self-hosted runners to use a faster cache backend.

## Cirrus Runners integration

Cirrus Runners run an omni-cache sidecar instance by default, making the changes in your CI workflows as simple as:

```diff
-- uses: actions/cache@v5
+- uses: cirruslabs/cache@v5
   with:
     path: node_modules
     key: node_modules
```

## Self-hosted runners integration

If running outside of Cirrus Runners, simply use `setup-omni-cache` action to start an omni-cache sidecar before caching:

```yaml
steps:
  - name: Setup omni-cache
    uses: cirruslabs/setup-omni-cache@main
    with:
      bucket: ci-omni-cache
      s3-endpoint: ${{ secrets.S3_ENDPOINT }} # can be R2 or any other S3-compatible storage
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_REGION: us-east-1
  - name: Cache node modules
    uses: cirruslabs/cache@v5
    with:
      path: node_modules
      key: node_modules
```

## Why?

Because the following PRs were closed/not merged yet:

* https://github.com/actions/cache/pull/679
* https://github.com/actions/toolkit/pull/1695
