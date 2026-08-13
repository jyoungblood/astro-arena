# Release version 0.1.0

This package uses npm trusted publishing from a GitHub Release.

## Repository controls

1. Create an npm trusted publisher for the GitHub repository and the `release.yml` workflow.
2. Create a GitHub environment named `npm`.
3. Add required reviewers to the environment when the project needs release approval.

The workflow uses an OpenID Connect identity. It does not use an npm token.

## Prepare the release

Run the complete package verification.

```sh
pnpm install --frozen-lockfile
pnpm run verify
pnpm run test:tarball
pnpm run test:smoke
```

Run the playground verification in the sibling repository.

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
```

Inspect the tarball contents. Make sure that the README, documentation, license, change log, and `dist` files are present.

## Publish from GitHub

1. Push the approved commit and version tag.
2. Create a GitHub Release for the tag.
3. Publish the GitHub Release.
4. Approve the `npm` environment job when approval is required.

The release event starts `release.yml`. The final command publishes with npm provenance.

## After publication

Install `astro-arena@0.1.0` in a clean Astro project. Then import the root package and `astro-arena/api`.

Make sure that the npm page contains the README and provenance statement. Add the release date to `CHANGELOG.md`.

## Current limitations

- The package is ESM-only.
- The channel loaders get one page per call.
- Live collections require Astro 7 and a server adapter.
- The loader does not download or transform Are.na images.
- Private static content can enter public build files.
