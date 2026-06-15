# Bug Solved

## Bug Source
Classmate (BUZZ-IT exam project)

## Bug Title
Basic Auth accepts any password

## Problem Summary
The products API was supposed to require both a valid username and password for Basic Authentication. In practice, sending the correct username (`admin`) with any wrong password still allowed access to all `/api/products` endpoints. Security was broken because only half of the credentials were being checked.

## Root Cause
In `server/src/middleware/basicAuth.ts`, the `requireBasicAuth` function only compared the username against `env.basicAuthUsername`. The password from the request was parsed from the `Authorization` header but never validated against `env.basicAuthPassword`. As a result, any password worked as long as the username matched.



## Solution Applied
Restored the password check in the authentication condition inside `requireBasicAuth`:

```typescript
if (
  !credentials ||
  credentials.username !== env.basicAuthUsername ||
  credentials.password !== env.basicAuthPassword
) {
  res.status(401).json({
    success: false,
    message: "Unauthorized access",
  });
  return;
}
```

**File changed:** `server/src/middleware/basicAuth.ts`

## Tested Endpoint
GET `/api/products`

## Testing Steps
1. Start the server with `npm run dev:server`.
2. In Postman, send **GET** `http://localhost:4000/api/products`.
3. Set **Authorization** → **Basic Auth** with Username `admin` and Password `wrongpassword`.
4. Send the request and confirm **401 Unauthorized**.
5. Repeat with Username `admin` and Password `password123` (correct credentials).
6. Confirm **200 OK** and a valid product list response.

## Final Result
After the fix, requests with a wrong password return **401** with:

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

Requests with the correct username and password (`admin` / `password123`) return **200 OK** with the product data. Basic Authentication now validates both credentials as expected.
