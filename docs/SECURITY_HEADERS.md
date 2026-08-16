# WorkFlowOS Security Headers

## Current Configuration

The NestJS application applies Helmet with the following headers:

```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
})
```

## Headers Produced

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | `default-src 'self'` | Restricts resource loading |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | Enforces HTTPS |
| Referrer-Policy | `strict-origin-when-cross-origin` | Controls referrer leakage |
| X-Content-Type-Options | `nosniff` (Helmet default) | Prevents MIME sniffing |
| X-Frame-Options | `SAMEORIGIN` (Helmet default) | Clickjacking protection |
| X-Download-Options | `noopen` | Legacy IE protection |
| Cross-Origin-Opener-Policy | `same-origin` (Helmet default, newer) | Isolates browsing context |

## CSP Notes

- `'unsafe-inline'` for style is required by Next.js/Tailwind
- `'unsafe-inline'` for script is required by Next.js hydration in dev; review for production
- `imgSrc` allows `data:` for inline images and `https:` for avatars

## Verification

Test with curl:
```bash
curl -I http://localhost:3001/health
```

Expected: CSP, HSTS, Referrer-Policy, X-Content-Type-Options headers present.

## Production Consideration

For stricter production CSP:
1. Remove `'unsafe-inline'` from `scriptSrc` after confirming Next.js builds
2. Add hashes/nonces for inline scripts
3. Tighten `styleSrc` — Next.js emits inline styles for critical CSS