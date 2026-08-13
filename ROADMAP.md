# `astro-arena` Implementation Roadmap

## Operating Rules

Complete the slices in order. Keep only one slice in progress.

At the end of each slice:

1. Run all acceptance commands for the slice.
2. Correct all failures caused by the slice.
3. Update the slice status and handoff record.
4. Continue while safe work remains.

Use these status values:

- `PENDING`
- `IN PROGRESS`
- `COMPLETE`
- `BLOCKED`

## Status

| Slice | Name | Status |
| --- | --- | --- |
| 1 | Repository foundation | COMPLETE |
| 2 | References, authentication, and client | COMPLETE |
| 3 | Data model and entry conversion | COMPLETE |
| 4 | Static block loader | COMPLETE |
| 5 | Static channel loader | COMPLETE |
| 6 | Live channel loader | COMPLETE |
| 7 | SDK collections and exports | COMPLETE |
| 8 | Astro integration and package quality | COMPLETE |
| 9 | README and core documentation | COMPLETE |
| 10 | Advanced documentation | COMPLETE |
| 11 | Separate playground | COMPLETE |
| 12 | CI, release preparation, and final audit | COMPLETE |

## Slice 1: Repository Foundation

### Intent

Create a package that builds before loader behavior exists.

### Work

- Initialize Git and pnpm.
- Add `package.json` for `astro-arena@0.1.0`.
- Add TypeScript and tsup configuration.
- Add Vitest and MSW configuration.
- Add Biome configuration.
- Add `.gitignore`, `LICENSE`, and `CHANGELOG.md`.
- Add placeholder root and `./api` exports.
- Add scripts for formatting, type checking, tests, build, and package checks.

### Acceptance

- `pnpm install` succeeds.
- `pnpm run check` succeeds.
- `pnpm run typecheck` succeeds.
- `pnpm run test` succeeds.
- `pnpm run build` succeeds.
- The repository contains no generated files that belong in `.gitignore`.

## Slice 2: References, Authentication, and Client

### Intent

Create the shared request foundation for every loader.

### Work

- Parse supported Are.na web and API URLs.
- Accept channel slugs and numeric resource IDs.
- Reject unsupported hosts and resource mismatches.
- Add shared client options.
- Read `ARENA_BEARER_TOKEN` through the Astro server secret API.
- Add explicit token overrides and `token: false`.
- Implement `arena.client()` with `@aredotna/sdk`.
- Add `ArenaLoaderError` and safe error formatting.

### Acceptance

- Parser tests cover valid and invalid inputs.
- If no token exists, public requests omit the authorization header.
- Private requests send the correct bearer header.
- Explicit tokens override the environment token.
- `token: false` forces an anonymous request.
- Tests prove that credentials do not appear in errors or logs.
- All Slice 1 commands continue to succeed.

## Slice 3: Data Model and Entry Conversion

### Intent

Convert Are.na resources into consistent Astro entries.

### Work

- Add forward-compatible block and channel schemas.
- Keep official SDK types as the compile-time source.
- Convert block IDs to strings.
- Prefix nested channel IDs with `channel:`.
- Preserve connection and resource metadata.
- Populate `body` and `rendered.html`.
- Implement the blocks-only default.
- Add the `includeChannels` option.
- Generate entry digests.

### Acceptance

- Tests cover Text, Image, Link, Attachment, Embed, and Pending blocks.
- Tests cover nested channels.
- Block IDs and channel IDs cannot collide.
- Text content and descriptions produce the correct Astro fields.
- Unknown additive fields remain in entry data.
- All earlier acceptance commands continue to succeed.

## Slice 4: Static Block Loader

### Intent

Load one public or private block into a build-time collection.

### Work

- Implement `arena.block()`.
- Fetch one block through the official SDK.
- Parse the block through `parseData()`.
- Store the entry with its digest and rendered content.
- Persist the request fingerprint and ETag.
- Send `If-None-Match` for unchanged requests.
- Keep the current store after `304` responses and failures.
- Normalize block errors through `ArenaLoaderError`.

### Acceptance

- Tests cover public and private blocks.
- Tests cover changed and unmodified responses.
- Tests cover missing, forbidden, malformed, and rate-limited responses.
- A failed refresh does not clear the current store.
- A changed source forces a full request.
- All earlier acceptance commands continue to succeed.

## Slice 5: Static Channel Loader

### Intent

Load one page of channel contents into a build-time collection.

### Work

- Implement `arena.channel()`.
- Forward typed channel query parameters.
- Fetch exactly one page per synchronization.
- Store blocks by default.
- If `includeChannels` is true, retain nested channels.
- Preserve embedded connection data.
- Reuse the ETag and fingerprint utilities.
- Add clear loader logs without credentials.

### Acceptance

- Tests cover `page`, `per`, `sort`, and `user_id`.
- A synchronization makes only one contents request.
- Blocks-only output excludes nested channels.
- `includeChannels: true` retains nested channels.
- Connection position, pinned state, and metadata remain unchanged.
- `304` responses keep the current store.
- All earlier acceptance commands continue to succeed.

## Slice 6: Live Channel Loader

### Intent

Provide fresh channel data for server-rendered Astro routes.

### Work

- Implement `arena.liveChannel()`.
- Implement `loadCollection()` for one channel page.
- Merge runtime filters over loader query values.
- Implement block and nested-channel entry lookup.
- Return `undefined` for missing entries.
- Return loader errors through the live loader contract.
- Add entry and collection cache hints.
- Do not add polling or a cache duration.

### Acceptance

- Tests cover collection and entry requests.
- Tests cover runtime filter precedence.
- Tests cover blocks-only and nested-channel modes.
- Tests cover missing entries and request errors.
- Cache hints contain stable tags and valid dates.
- Private content receives no automatic public cache duration.
- All earlier acceptance commands continue to succeed.

## Slice 7: SDK Collections and Exports

### Intent

Make every Are.na v3 operation available without more specialized loaders.

### Work

- Finalize the `arena` namespace exports.
- Export public loader types, schemas, and errors.
- Implement the `astro-arena/api` subpath.
- Re-export generated SDK operations and types.
- Add typed custom collection examples.
- Cover list responses, singleton responses, and mixed resources.
- Document resource-prefixed entry IDs in source comments and fixtures.

### Acceptance

- Root imports resolve from built package output.
- `astro-arena/api` imports resolve from built package output.
- Client-defined collections type-check.
- Singleton and list examples produce valid Astro entries.
- Mixed resource examples use collision-free IDs.
- All earlier acceptance commands continue to succeed.

## Slice 8: Astro Integration and Package Quality

### Intent

Prove that the package works as an installed Astro dependency.

### Work

- Add minimal Astro integration fixtures.
- Run build-time collection synchronization in fixtures.
- Build a live collection fixture with a server adapter.
- Add Astro 6 and Astro 7 compatibility jobs.
- Finalize package exports, files, source maps, and peer dependencies.
- Add publint and Are The Types Wrong checks.
- Add a clean tarball installation test.

### Acceptance

- Astro 6 synchronization and build succeed.
- Astro 7 synchronization and build succeed.
- Live fixture build succeeds with the adapter.
- `publint` succeeds.
- Are The Types Wrong succeeds.
- `npm pack` includes only the intended files.
- A clean fixture can install and import the tarball.
- All earlier acceptance commands continue to succeed.

## Slice 9: README and Core Documentation

### Intent

Give a new user a complete path from installation to useful content.

### Work

- Read and use the Simple English skill.
- Write the README installation and quickstart sections.
- Document public channel and block loaders.
- Document private channel and block access.
- Document nested channels and rendering.
- Add a prominent custom SDK collection example.
- Add common troubleshooting steps.
- Add the full documentation index.

### Acceptance

- Every code example type-checks in a fixture.
- Every local documentation link resolves.
- The README contains no real token or private identifier.
- The Simple English self-check succeeds.
- All earlier acceptance commands continue to succeed.

## Slice 10: Advanced Documentation

### Intent

Document the complete behavior and important safety boundaries.

### Work

- Read and use the Simple English skill.
- Write the loader API guide.
- Write the custom SDK collection guide.
- Write authentication and private content guidance.
- Write pagination and filtering guidance.
- Write the live collections guide.
- Write data, rendering, metadata, and image guidance.
- Write caching, rate-limit, error, security, and deployment guidance.

### Acceptance

- Documentation covers users, groups, feeds, followers, notifications, and search.
- Documentation states that live collections require a server adapter.
- Documentation states that static output can expose private content.
- Documentation states that the loader never walks every page.
- Every code example type-checks.
- Every local and external link resolves.
- The Simple English self-check succeeds.
- All earlier acceptance commands continue to succeed.

## Slice 11: Separate Playground

### Intent

Exercise the package in a real application outside the package repository.

### Work

- Create `/Users/jy/Desktop/projects/astro-arena-playground` as a Git repository.
- If the directory is not writable, request filesystem access.
- Create an Astro 7 application with the Node adapter.
- Link `../astro-arena` as a local dependency.
- Add a static public channel page.
- Add static block detail pages.
- Add a live channel page.
- Add a custom SDK collection.
- Add optional private content configuration.
- Add `.env.example` without credentials.
- Add playground usage instructions.

### Acceptance

- The playground installs from a clean state.
- Astro type checking succeeds.
- The production build succeeds.
- Public channel pages use Arena Influences by default.
- Private examples remain inactive without environment variables.
- No token appears in source or generated files.
- Ask the user to inspect the pages manually.
- Do not use browser automation.

## Slice 12: CI, Release Preparation, and Final Audit

### Intent

Make version `0.1.0` ready for publication without publishing it.

### Work

- Add CI for Node.js 22 and 24.
- Include Astro 6 and Astro 7 compatibility checks.
- Add an opt-in public Are.na smoke test.
- Add a GitHub Release workflow for npm trusted publishing.
- Enable npm provenance in the release workflow.
- Run the complete package and playground test matrix.
- Audit documentation, package contents, and exported types.
- Search the repositories for credentials and private test data.
- Record final limitations and release steps.

### Acceptance

- Every package command succeeds from a clean checkout.
- Every playground command succeeds from a clean checkout.
- The opt-in public smoke test succeeds.
- The package tarball installs in a clean Astro project.
- CI and release workflow files pass local syntax checks.
- Documentation matches the implemented API.
- The secret scan finds no credentials.
- Version `0.1.0` is package-ready.
- Do not publish, create remote repositories, or push changes.

## Handoff Record

Add one record after each completed slice:

```md
### Slice N Handoff

- Status: COMPLETE
- Changes:
- Verification:
- Decisions:
- Limitations:
- Next slice:
```

### Slice 1 Handoff

- Status: COMPLETE
- Changes: Initialized Git and added the pnpm, TypeScript, tsup, Vitest, MSW, Biome, and package foundations.
- Verification: `pnpm install`, `pnpm run check`, `pnpm run typecheck`, `pnpm run test`, and `pnpm run build` succeed.
- Decisions: Pinned TypeScript 5.9 because the tsup declaration bundler does not support TypeScript 7.
- Limitations: The package exports placeholders until later slices replace them.
- Next slice: Slice 2, references, authentication, and client.

### Slice 2 Handoff

- Status: COMPLETE
- Changes: Added strict Are.na source parsing, Astro server-secret token resolution, anonymous and explicit token modes, the official SDK client wrapper, and safe loader errors.
- Verification: Parser, authentication, client, and error tests pass. `pnpm run check`, `pnpm run typecheck`, `pnpm run test`, and `pnpm run build` succeed with 33 tests.
- Decisions: The token fallback is a lazy getter so `ARENA_BEARER_TOKEN` stays server-only and is read only when the SDK sends a request. Public SDK use outside an initialized Astro runtime remains anonymous.
- Limitations: Specialized loaders are not available until Slices 4–6. The ambient module declaration only supplies the public `astro:env/server` type that Astro does not expose to package TypeScript projects.
- Next slice: Slice 3, data model and entry conversion.

### Slice 3 Handoff

- Status: COMPLETE
- Changes: Added permissive SDK-backed block and channel schemas, collision-free entry IDs, raw resource preservation, digest generation, render fields, and blocks-only channel-content selection.
- Verification: Tests cover Text, Image, Link, Attachment, Embed, PendingBlock, nested channels, additive fields, metadata preservation, rendering, and channel filtering. All package gates pass with 43 tests.
- Decisions: Text blocks use their content for `body` and `rendered.html`. Other resources use their description. The runtime schemas validate stable resource identity fields and permit additive API fields.
- Limitations: Entry conversion is internal until the static loaders use it in Slices 4 and 5.
- Next slice: Slice 4, static block loader.

### Slice 4 Handoff

- Status: COMPLETE
- Changes: Added `arena.block()`, official generated SDK block requests, runtime response validation, Astro entry storage, request fingerprints, ETags, conditional requests, and failure-safe store updates.
- Verification: MSW tests cover public and authenticated requests, changed and unmodified responses, source changes, malformed data, authentication, forbidden, missing, and rate-limit failures. All package gates pass with 52 tests.
- Decisions: The loader accepts either `id` or `url`. It uses the SDK generated operation with the configured official SDK client so response headers remain available for ETag handling.
- Limitations: ETag reuse depends on Are.na returning an ETag. If it does not, the loader safely performs a full request on the next synchronization.
- Next slice: Slice 5, static channel loader.

### Slice 5 Handoff

- Status: COMPLETE
- Changes: Added `arena.channel()` with official typed and forward-compatible query forwarding, one-page synchronization, blocks-only defaults, optional nested channels, ETag reuse, safe logging, and failure-safe replacement.
- Verification: MSW tests cover `page`, `per`, `sort`, `user_id`, a single request, nested-channel filtering, private access, connection and metadata preservation, 304 handling, and failed refreshes. All package gates pass with 57 tests.
- Decisions: Query values are forwarded without package-level filtering. Unknown additive keys type-check so new endpoint parameters can work before a package update.
- Limitations: The loader intentionally stores only the requested API page and does not expose pagination metadata as collection entries.
- Next slice: Slice 6, live channel loader.

### Slice 6 Handoff

- Status: COMPLETE
- Changes: Added `arena.liveChannel()` with one-page collection loading, block and nested-channel entry lookup, runtime query overrides, structured live errors, and entry and collection cache hints.
- Verification: MSW tests cover collection and entry requests, filter precedence, blocks-only and nested-channel modes, missing entries, forbidden errors, stable tags, valid dates, and the absence of a cache duration. All package gates pass with 61 tests.
- Decisions: Entry lookup searches the configured channel page so it preserves the embedded connection context. Live requests do not poll and provide only tag and modification-time cache hints.
- Limitations: An entry outside the configured page returns `undefined`. Applications must select another page through query filters when needed.
- Next slice: Slice 7, SDK collections and exports.

### Slice 7 Handoff

- Status: COMPLETE
- Changes: Finalized root loader, schema, error, SDK resource-type exports and the `astro-arena/api` generated-operation subpath. Added built self-import checks and typed custom collection examples for singleton, list, and mixed responses.
- Verification: `arena.client()` examples inside `defineCollection()` type-check. Package build verification resolves root and API subpath functions from `dist`. All package gates pass with 61 tests.
- Decisions: Custom mixed collections use resource-prefixed IDs such as `block:34`, `channel:56`, and `user:12`. Specialized channel entries keep the shorter block ID convention from the approved API.
- Limitations: Functional custom collections intentionally do not inherit specialized ETag, response validation, rendering, or error behavior.
- Next slice: Slice 8, Astro integration and package quality.

### Slice 8 Handoff

- Status: COMPLETE
- Changes: Added installed Astro 6 and Astro 7 fixtures, mocked content synchronization, an Astro 7 Node-adapter live fixture, package audits, built-export checks, and a clean tarball installation test.
- Verification: Astro 6.4.8 and Astro 7.2.1 checks and builds pass. The live server build passes. Publint passes. Are The Types Wrong passes its ESM-only profile. The tarball contains only intended release files and installs and imports in a fresh project.
- Decisions: Public loader declarations use a minimal structural Astro contract. This avoids binding consumers to the development copy of Astro 7 and makes the same package types compatible with Astro 6. The package is ESM-only, so the ESM audit profile is authoritative.
- Limitations: The local npm user cache is not writable. Package scripts use an isolated temporary cache. CommonJS `require()` is not supported by this ESM-only package.
- Next slice: Slice 9, README and core documentation.

### Slice 9 Handoff

- Status: COMPLETE
- Changes: Added the README quick start, channel and block examples, private-content warning, nested-channel and rendering guidance, custom SDK collection example, troubleshooting, and the core documentation index and guides.
- Verification: All core documentation links resolve. Mirrored TypeScript examples compile. The documentation checker reports no contractions, unsupported modals, semicolons, or sentences with more than 25 words. All package gates pass.
- Decisions: Documentation uses “make sure” for corrective checks and “configuration” for setup data. Procedures use imperative commands, and descriptions use simple present tense.
- Limitations: The external-link audit and advanced operations guides belong to Slice 10.
- Next slice: Slice 10, advanced documentation.

### Slice 10 Handoff

- Status: COMPLETE
- Changes: Added guides for the loader API, SDK collections, authentication, pagination, filters, live collections, raw data, rendering, images, caching, rate limits, errors, security, and deployment.
- Verification: All 12 documentation files pass the Simple English checker. Mirrored examples compile. All local links resolve, and live requests confirm that all five external links resolve. All package gates pass.
- Decisions: The live guide requires Astro 7 and a server adapter. The pagination guide keeps specialized loaders to one page and makes complete iteration an explicit SDK action.
- Limitations: Full STE dictionary compliance requires the official ASD-STE100 dictionary. The project uses the skill's pragmatic mode and structural checks.
- Next slice: Slice 11, separate playground.

### Slice 11 Handoff

- Status: COMPLETE
- Changes: Created the sibling Astro 7 Git repository with the Node adapter, local package link, static channel and block pages, live channel page, custom SDK collection, optional private collection, environment example, and usage guide.
- Verification: A frozen-lockfile installation succeeds. `astro check` reports zero diagnostics. The production build creates 12 block details and four other static pages, plus the live server route. A credential-value scan returns no matches.
- Decisions: The public defaults use Arena Influences and block `9613792`. The custom user collection uses `charles-broskoski`, a valid public v3 user from the channel data.
- Limitations: The private collection is inactive until both private configuration and a valid server token exist. Visual inspection remains a user task because browser automation is prohibited.
- Next slice: Slice 12, CI, release preparation, and final audit.

### Slice 12 Handoff

- Status: COMPLETE
- Changes: Added Node 22 and 24 CI, Astro compatibility and documentation jobs, an opt-in smoke workflow, and trusted npm release publishing with provenance. Added workflow validation, a public API smoke test, a credential audit, release instructions, and final package metadata.
- Verification: The complete package matrix passes on Node 22 and 24. Normal tests pass with 61 tests and one skipped smoke test. The opt-in public smoke test passes against Are.na. Astro 6.4.8 and Astro 7.2.1 checks and builds pass. Workflow validation, documentation checks, package audits, the clean tarball installation, and the credential audit pass. The playground installs with a frozen lockfile, type-checks with zero diagnostics, and builds successfully.
- Decisions: The release workflow uses npm trusted publishing and does not store an npm token. The real API test has a separate configuration so normal tests must continue to use MSW. GitHub Releases initiate publication after the npm trusted publisher is configured.
- Limitations: The package is ESM-only. Static channel loaders fetch one API page. Live collections require Astro 7 and a server adapter. The package does not transform Are.na images. Static private collections can write private data into a build. The user must complete visual playground inspection. No npm package, remote repository, commit, or push was created.
- Next slice: None. Version 0.1.0 is ready for review and publication.
