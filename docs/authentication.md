# Authentication and private content

## Token source

The package reads `ARENA_BEARER_TOKEN` through `astro:env/server` when a loader does not have a token property.

Create a local `.env` file.

```dotenv
ARENA_BEARER_TOKEN=replace_with_your_token
```

Do not add `.env` to Git. Add the variable to the secret controls of the deployment service.

If the variable does not exist, the SDK sends an anonymous request.

## Explicit token

You can supply a string or a token function.

```ts
const client = arena.client({
  token: () => process.env.ARENA_BEARER_TOKEN,
});
```

An explicit token has priority over the Astro secret. Set `token: false` to force anonymous access.

## Private content warning

> **WARNING:** Do not assume that a static collection stays private. A static build can copy its data into public files.

Inspect generated HTML, data files, and source maps before deployment. Restrict access to all build artifacts that contain private data.

Use a live collection when data must remain behind server authorization. A live route still needs application access controls.

## Token safety

The package does not include a token in its logs or normalized errors. Do not put a token in a URL or an entry object.

Rotate the token if it appears in a log, snapshot, build artifact, or Git history.
