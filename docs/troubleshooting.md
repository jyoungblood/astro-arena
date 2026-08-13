# Troubleshooting

## `AUTHENTICATION_ERROR`

Make sure that the token is valid. Make sure that the process can read `ARENA_BEARER_TOKEN`.

If the resource is public, set `token: false` to do an anonymous request.

## `FORBIDDEN`

The token owner cannot access the resource. Open the resource with the same Are.na account.

## `NOT_FOUND`

Make sure that the URL, slug, or ID is correct. Are.na can return this error for hidden private resources.

## `RATE_LIMITED`

Wait until the Are.na reset time. Then run the content synchronization again.

Reduce `per` or reduce the number of collections if the error occurs frequently.

## `INVALID_SOURCE`

Use an HTTPS Are.na URL, a channel slug, or a positive numeric ID. Do not use a block URL for a channel loader.

## `INVALID_RESPONSE`

Are.na returned data that did not identify a supported block or channel. Make sure that the installed package versions are current.

## A channel page is incomplete

The loader gets exactly one page. Set the `page` and `per` query values for the required page.

Use the SDK pagination helper for request-time access to more pages. Do not expect the specialized loader to enumerate the channel.

## A nested channel is absent

Set `includeChannels: true`. Nested channels use entry IDs such as `channel:123`.

## Old content remains after an error

This behavior is intentional. A failed refresh does not clear the current Astro store.

Correct the request error. Then run the content synchronization again.
