# Security and deployment

## Protect the token

Store `ARENA_BEARER_TOKEN` in the secret controls of the build or deployment service. Do not put the token in source code.

The package reads the variable through `astro:env/server`. Do not import a server secret into a client script.

Do not include a token in these locations:

- Are.na URLs
- Astro entry data
- Logs and snapshots
- Browser error messages
- Public build variables

Rotate the token if it enters one of these locations.

## Static private content

> **WARNING:** Inspect all static output before deployment. A static build can copy private content into public files.

Inspect HTML, generated data, source maps, deployment logs, and build caches. Restrict every artifact that contains private data.

Use a separate private deployment when the generated site must stay private. Site authentication must protect every route and asset.

## Live private content

A live collection keeps the Are.na request on the server. It does not add authorization to the Astro route.

Add application authentication before the route gets private content. Do not give a private response a shared public cache duration.

## Deployment variables

Add `ARENA_BEARER_TOKEN` as a secret variable in each environment that needs private access.

If a preview does not need private data, omit the variable or set `token: false` in its collection.

## Source maps and logs

The package does not write token values to loader logs. It also replaces SDK failures with safe loader messages.

Server logs can still contain application errors. Restrict log access and use a short retention period for sensitive deployments.

## Release controls

Run package checks before deployment.

```sh
pnpm run check
pnpm run typecheck
pnpm run test
pnpm run build
```

If private data was part of a build, scan the output before upload.
