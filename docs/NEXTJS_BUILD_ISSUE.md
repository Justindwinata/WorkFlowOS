# Next.js Build Issue (ARM64)

## Problem

On ARM64 macOS with Node 20/22, `next build` crashes with:
```
thread '' panicked at napi-2.15.0/src/error.rs
fatal runtime error: failed to initiate panic, error 5
```

## Root Cause

The `@next/swc-darwin-arm64` binary has a known panic bug on certain ARM64 configurations with newer Node.js versions.

## Current Status

- `npm run dev` works fine
- `npx tsc --noEmit` passes
- Only production build (`next build`) fails

## Workaround Options

1. **CI Verification**: Use GitHub Actions with `ubuntu-latest` (x86) to verify builds
2. **Local Docker**: Use x86 Docker container for builds
3. **SWC Fallback**: Add to `next.config.mjs`:
   ```js
   experimental: {
     swcPlugins: [],
   },
   ```
4. **Babel Fallback**: Use Babel instead of SWC (slower builds)

## Recommended Solution

For Phase 2, we document this limitation and rely on CI (GitHub Actions) for production build verification. The application code is TypeScript-valid and runs correctly in development mode.

## Related Issues

- https://github.com/vercel/next.js/issues/64398
- https://github.com/napi-rs/napi-rs/issues/2286
