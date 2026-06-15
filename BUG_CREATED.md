# Bug Created

## Bug Title
Basic Auth accepts any password

## Bug Description
The products API uses Basic Authentication, but it only checks the username. If the username is correct (`admin`), any password is accepted and the request succeeds.

## Affected Endpoint
All `/api/products` endpoints (GET, POST, PUT, DELETE)

## Steps to Reproduce
1. Start the server with `npm run dev:server`.
2. In Postman, open **GET** `http://localhost:4000/api/products`.
3. Go to **Authorization** → **Basic Auth**.
4. Set Username: `admin` and Password: `wrongpassword` (not the real password).
5. Send the request.

## Expected Result
The API should return **401 Unauthorized** with:
```json
{ "success": false, "message": "Unauthorized access" }
```

## Actual Result
The request succeeds and returns the product list with **200 OK**.

## Hint
Open the Basic Auth middleware file and check whether both the username and password are validated.
