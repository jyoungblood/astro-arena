# Caching, rate limits, and errors

## Build-time ETags

The block and channel loaders store the Are.na ETag and a request fingerprint in Astro metadata.

For an unchanged request, the next synchronization sends `If-None-Match`. A `304` response keeps the current store.

A source, query, or `includeChannels` change creates a new fingerprint. The loader then makes a full request without the old ETag.

If Are.na does not send an ETag, the next synchronization makes a full request.

## Safe store replacement

The loader parses all response data before it clears the current store. A request or parse failure keeps the previous entries.

Correct the error before you depend on the old data. Old data can differ from the current Are.na resource.

## Live cache hints

The live loader supplies tags such as `arena:block:123` and `arena:channel:456`. It also supplies valid resource modification dates.

The loader does not supply `maxAge`, stale-while-revalidate, or another cache duration. The application owns that policy.

## Error codes

Specialized loaders use `ArenaLoaderError` with these codes:

| Code | Meaning |
| --- | --- |
| `AUTHENTICATION_ERROR` | Are.na rejected the token. |
| `FORBIDDEN` | The account cannot access the resource. |
| `INVALID_RESPONSE` | The request or returned data was not valid. |
| `INVALID_SOURCE` | The URL, slug, or ID was not valid for the loader. |
| `NETWORK_ERROR` | The SDK did not reach Are.na. |
| `NOT_FOUND` | The resource does not exist or is not visible. |
| `RATE_LIMITED` | The Are.na request limit was reached. |
| `REQUEST_ERROR` | Another API or runtime error occurred. |

Normalized messages do not contain tokens. The original error remains available as `cause` for server-side diagnosis.

Do not send the error cause to a browser. An SDK error can contain request details.

## Rate limits

The official SDK reads Are.na rate-limit headers. It supports retry configuration through the shared client input.

```ts
arena.channel({
  id: "arena-influences",
  retry: { maxRetries: 2, respectRateLimits: true },
});
```

Reduce request frequency when rate-limit errors continue. The specialized channel loader never adds automatic page enumeration.
