Admin role flow — Studio TFA

Purpose
- Document how the app determines admin access and how to test it locally.

Key pieces

1) Database
- `public.profiles` holds the user's `role` (one of: `customer`, `staff`, `admin`, `wholesale`).
- The `role` column should only be changed by server-side processes (service_role) — never from client code.

2) Server-side resolution
- Server code calls `resolveViewerRole()` ([src/lib/security/viewerRole.ts]) which:
  - Uses the server Supabase client to get the signed-in user.
  - Uses `createAdminClient()` to query `public.profiles` for the user's `role`.
  - Returns `isAdmin: role === 'admin'`.
- The root layout is configured as `dynamic = "force-dynamic"` so the role is resolved per request.

3) Client behavior
- The Navbar shows the Admin button when `isAdmin` is true.
- There is an API endpoint `/api/admin/is-admin` that returns `{ isAdmin: boolean }` and can be used for debugging.

How to test locally (quick)

1) Start the Next dev server:

```bash
npm run dev
```

2) In your browser (signed in as the user you want to test), open DevTools Console and run:

```javascript
fetch('/api/admin/is-admin?debug=1', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

You should see something like:

```json
{ "isAdmin": true, "role": "admin" }
```

3) Or use the provided Node script (good for CI or automated checks):

```bash
# Example (set COOKIE to include your auth cookie if testing remotely)
COOKIE="sb-access-token=...;" node tools/test-admin-check.js http://localhost:3000
```

If the script exits with code 0, the account is admin.

Debugging tips
- If `isAdmin` is true but you expect false: check the DB row for the user in `public.profiles`.
- If `isAdmin` is false but you expect true: ensure `public.profiles` contains the user with role `admin` and `resolveViewerRole` can query it (service role key configured).
- Server logs include role resolution entries: search for `[resolveViewerRole]` and `[api/admin/is-admin]` in server logs.

Security notes
- Never allow client-side updates to the `role` column. Only allow `service_role` to write `role`.
- Use RLS policies to restrict updates to `role` to `service_role` or server-side triggers.

Contact
- For help, run the test script and paste the output here when reporting an issue.
