/*
Simple admin check test script.

Usage:
  NODE_ENV=development node tools/test-admin-check.js
  NODE_ENV=development COOKIE="sb-access-token=...;" node tools/test-admin-check.js http://localhost:3000

Environment:
  - First argument (optional): base URL (default http://localhost:3000)
  - COOKIE env var (optional): the auth cookie header to send with the request

This script calls /api/admin/is-admin?debug=1 and prints the JSON response.
Exits with code 0 if isAdmin === true, otherwise exits with code 1.
*/

const [,, baseArg] = process.argv;
const BASE = baseArg || process.env.BASE_URL || 'http://localhost:3000';
const COOKIE = process.env.COOKIE || process.env.COOKIE_STRING || '';

async function main() {
  try {
    const url = `${BASE.replace(/\/$/, '')}/api/admin/is-admin?debug=1`;
    const headers = {
      'Accept': 'application/json',
    };
    if (COOKIE) headers['Cookie'] = COOKIE;

    const res = await fetch(url, { headers, credentials: 'include' });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }

    console.log('REQUEST:', url);
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', JSON.stringify(json, null, 2));

    if (res.ok && json && json.isAdmin) {
      console.log('\nResult: ADMIN access confirmed');
      process.exit(0);
    }

    console.log('\nResult: not admin or request failed');
    process.exit(1);
  } catch (err) {
    console.error('Error calling admin check:', err);
    process.exit(2);
  }
}

main();
