# Node Auth TS

A REST API built with **Node.js, Express, TypeScript, MongoDB, Mongoose, and JWT**. This project demonstrates authentication, role-based access control (RBAC), refresh-token handling, and book CRUD operations with ownership checks.

## Features

- User signup and login
- Password hashing using bcrypt
- JWT access tokens and refresh tokens
- Refresh token stored in an HttpOnly cookie
- Logout functionality
- Role-based access control (`admin`, `creator`, and `visitor`)
- Protected book routes
- Book ownership validation
- MongoDB running in Docker
- CORS configuration using environment variables

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JSON Web Token (`jsonwebtoken`)
- bcrypt
- cookie-parser
- cors
- Docker

## Getting Started

### Prerequisites

Install the following:

- Node.js and npm
- Docker Desktop or Docker Engine

### 1. Clone the repository

```bash
git clone https://github.com/affanso/node-auth-ts.git
cd node-auth-ts
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project's root directory.

```env
PORT=8000
HOST_URL=http://localhost:3000

MONGO_URI=mongodb://admin:password123@localhost:27017/auth_db?authSource=admin

ACCESS_TOKEN_SECRET=your_strong_access_token_secret
REFRESH_TOKEN_SECRET=your_different_refresh_token_secret

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

**Environment variables:**

| Variable                   | Description                        |
| -------------------------- | ---------------------------------- |
| `PORT`                     | Port on which the backend runs     |
| `HOST_URL`                 | Frontend origin allowed by CORS    |
| `MONGO_URI`                | MongoDB connection string          |
| `ACCESS_TOKEN_SECRET`      | Secret used to sign access tokens  |
| `REFRESH_TOKEN_SECRET`     | Secret used to sign refresh tokens |
| `ACCESS_TOKEN_EXPIRES_IN`  | Access token expiration time       |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration time      |

Set `HOST_URL` to your frontend's actual origin, including the protocol and port. For example, a Vite frontend commonly uses `http://localhost:5173`.

Use different, strong, randomly generated JWT secrets. Never commit your `.env` file or real credentials to Git.

### 4. Start MongoDB using Docker

If the MongoDB container is already running, you can skip this step.

Otherwise, start the container using your project's Docker Compose configuration:

```bash
docker compose up -d
```

Check the running containers:

```bash
docker ps
```

### 5. Run the development server

Run the development script configured in `package.json`. For example:

```bash
npm run dev
```

The examples in this documentation assume the backend runs at:

```text
http://localhost:8000
```

## Authentication Flow

1. Register or log in to receive an access token.
2. The API sets the refresh token in an HttpOnly cookie.
3. Send the access token in the `Authorization` header when accessing protected routes.
4. Use the refresh endpoint to obtain a new access token.
5. Use the logout endpoint to clear the refresh-token cookie.

Protected requests use this header:

```http
Authorization: Bearer <access-token>
```

## API Documentation

**Base URL**

```text
http://localhost:8000/api
```

The following sample IDs, tokens, and responses are illustrative. Exact response messages and status codes depend on your controller implementation.

### Common Response Format

Successful responses generally follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

---

## 1. Root Endpoint

### `GET /`

Returns a welcome message.

**Request URL**

```http
GET http://localhost:8000/
```

**Sample response**

```json
{
  "success": true,
  "message": "Hello world"
}
```

Authentication is not required.

---

## 2. Authentication APIs

### Sign Up

**Endpoint:** `POST /auth/signup`

Creates a new user account.

**Sample request payload**

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "phone": "03001234567",
  "username": "alexmorgan",
  "password": "StrongPassword123",
  "role": "creator"
}
```

**Sample response**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "671234567890abcdef123456",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "phone": "03001234567",
      "username": "alexmorgan",
      "role": "creator"
    },
    "accessToken": "<access-token>"
  }
}
```

The refresh token is set in an HttpOnly cookie and should not be returned in the JSON response. The password must never be returned.

**Security note:** Public signup should not allow users to assign themselves the `admin` role.

### Login

**Endpoint:** `POST /auth/login`

Authenticates an existing user.

**Sample request payload**

```json
{
  "email": "alex@example.com",
  "password": "StrongPassword123"
}
```

**Sample response**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "671234567890abcdef123456",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "username": "alexmorgan",
      "role": "creator"
    },
    "accessToken": "<access-token>"
  }
}
```

The refresh token is set as an HttpOnly cookie.

### Refresh Access Token

**Endpoint:** `POST /auth/refresh`

Uses the refresh-token cookie to generate a new access token.

**Request**

```http
POST http://localhost:8000/api/auth/refresh
```

No JSON body is required. The client must send the refresh-token cookie.

**Sample response**

```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "<new-access-token>"
  }
}
```

If the refresh token is missing, invalid, or expired, the API should return an authentication error.

### Logout

**Endpoint:** `POST /auth/logout`

Clears the refresh-token cookie.

**Request**

```http
POST http://localhost:8000/api/auth/logout
```

The request should include the refresh-token cookie.

**Sample response**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

Clearing the cookie does not automatically invalidate an already-issued access token. Unless token revocation is implemented, it may remain valid until it expires.

---

## 3. Book APIs

Book creation, updating, and deletion require authentication and an allowed role, such as `creator` or `admin`.

Creators can manage their own books, while admins can manage any book.

### Get All Books

**Endpoint:** `GET /books/get-books`

Returns the list of books.

**Request**

```http
GET http://localhost:8000/api/books/get-books
Authorization: Bearer <access-token>
```

**Sample response**

```json
{
  "success": true,
  "message": "Books fetched successfully",
  "data": [
    {
      "_id": "671234567890abcdef654321",
      "name": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "publishYear": 1925,
      "description": "A classic American novel",
      "createdBy": {
        "_id": "671234567890abcdef123456",
        "name": "Alex Morgan",
        "email": "alex@example.com",
        "username": "alexmorgan"
      }
    }
  ]
}
```

The `createdBy` field contains populated user information if the controller uses Mongoose's `populate()` method.

### Add a Book

**Endpoint:** `POST /books/add-book`

Creates a new book. Requires authentication and an allowed role.

**Request headers**

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Sample request payload**

```json
{
  "name": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "publishYear": 1925,
  "description": "A classic American novel"
}
```

**Sample response**

```json
{
  "success": true,
  "message": "Book added successfully",
  "data": {
    "_id": "671234567890abcdef654321",
    "name": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "publishYear": 1925,
    "description": "A classic American novel",
    "createdBy": "671234567890abcdef123456"
  }
}
```

**Important:** Do not include `createdBy` in the request payload. The backend assigns it from the authenticated user's ID.

### Update a Book

**Endpoint:** `PUT /books/update-book/:id`

Updates an existing book. Replace `:id` with the book's MongoDB ObjectId.

**Request URL**

```http
PUT http://localhost:8000/api/books/update-book/671234567890abcdef654321
```

**Request headers**

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Sample request payload**

```json
{
  "name": "The Great Gatsby - Updated Edition",
  "author": "F. Scott Fitzgerald",
  "publishYear": 1925,
  "description": "An updated description"
}
```

**Sample response**

```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "_id": "671234567890abcdef654321",
    "name": "The Great Gatsby - Updated Edition",
    "author": "F. Scott Fitzgerald",
    "publishYear": 1925,
    "description": "An updated description",
    "createdBy": "671234567890abcdef123456"
  }
}
```

**Authorization rules:**

- A creator can update their own books.
- An admin can update any book.
- A creator attempting to update another user's book should receive `403 Forbidden`.
- A nonexistent book should return `404 Not Found`.

### Delete a Book

**Endpoint:** `DELETE /books/delete-book/:id`

Deletes an existing book. Replace `:id` with the book's MongoDB ObjectId.

**Request URL**

```http
DELETE http://localhost:8000/api/books/delete-book/671234567890abcdef654321
```

**Request header**

```http
Authorization: Bearer <access-token>
```

No JSON body is required.

**Sample response**

```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": null
}
```

**Authorization rules:**

- A creator can delete their own books.
- An admin can delete any book.
- A creator attempting to delete another user's book should receive `403 Forbidden`.
- A nonexistent book should return `404 Not Found`.

---

## Roles and Permissions

| Role      | Permissions                                                   |
| --------- | ------------------------------------------------------------- |
| `admin`   | Can manage any book                                           |
| `creator` | Can add books and update or delete their own books            |
| `visitor` | Read-only or limited access, depending on route configuration |

Authorization must be enforced by the backend. Hiding buttons or pages in the frontend is not sufficient to secure an API.

## Common HTTP Status Codes

| Status Code                 | Meaning                                           |
| --------------------------- | ------------------------------------------------- |
| `200 OK`                    | Request completed successfully                    |
| `201 Created`               | Resource created, if returned by the controller   |
| `400 Bad Request`           | Invalid or missing request data                   |
| `401 Unauthorized`          | Missing, invalid, or expired authentication token |
| `403 Forbidden`             | User lacks the required role or ownership         |
| `404 Not Found`             | Requested resource does not exist                 |
| `409 Conflict`              | Duplicate account details, if handled this way    |
| `500 Internal Server Error` | Unexpected server error                           |

Actual status codes depend on the implementation.

## Example: Add a Book Using cURL

```bash
curl -X POST http://localhost:8000/api/books/add-book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access-token>" \
  -d '{
    "name": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "publishYear": 1925,
    "description": "A classic American novel"
  }'
```

## CORS and Cookies

The backend uses `HOST_URL` as the allowed frontend origin.

For example, for a Vite frontend:

```env
HOST_URL=http://localhost:5173
```

Use the actual frontend origin, including protocol and port.

If your frontend sends refresh-token cookies across origins, configure CORS with `credentials: true`, use appropriate cookie options, and enable credentials on client requests.

For `fetch`:

```javascript
fetch("http://localhost:8000/api/auth/refresh", {
  method: "POST",
  credentials: "include",
});
```

For Axios:

```javascript
axios.post(
  "http://localhost:8000/api/auth/refresh",
  {},
  { withCredentials: true },
);
```

Do not combine credentialed browser requests with `Access-Control-Allow-Origin: *`.

## Security Notes

- Never commit `.env` or real credentials to Git.
- Use different, strong access-token and refresh-token secrets.
- Do not allow public signup to assign the `admin` role.
- Use HTTPS in production and configure cookies appropriately.
- Preserve your MongoDB Docker volume if you want data to survive container restarts.
- Updating a Mongoose schema does not automatically migrate existing MongoDB documents.
