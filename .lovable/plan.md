
# Plan: Remove /fee Route

## Summary
Remove the unnecessary `/fee` route from App.tsx. The sub-path routing will be handled by Vercel configuration at deployment, not React Router.

## Change Required

### File: `src/App.tsx`
Delete line 19:
```typescript
<Route path="/fee" element={<Calculator />} />
```

## Final Routes
After this change, the app will have:
- `/` → Calculator (primary route)
- `/calculator` → Calculator (legacy/alternative)
- `*` → NotFound (catch-all)

## Deployment Note
Your Vercel configuration will handle routing `core.qurate.com.au/fee` to the root of this app, so the Calculator will load correctly at that URL.
