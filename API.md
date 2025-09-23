# API Documentation

This document provides details on the available API endpoints for the streaming server.

##  Authentication

Some endpoints require authentication via a JSON Web Token (JWT). For protected routes, include the token in the `Authorization` header:

`Authorization: Bearer <your_jwt_token>`

---

##  Users & Channels

### 1. Register a New User

Creates a new user and their associated stream channel.

- **Method:** `POST`
- **Endpoint:** `/api/users/register`
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    },
    "token": "string" // JWT Token
  }
  ```
- **Error Responses:**
  - `409 Conflict`: If the email already exists.
  - `500 Internal Server Error`: For other server-side errors.

### 2. Log In

Authenticates a user and returns a JWT.

- **Method:** `POST`
- **Endpoint:** `/api/users/login`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "string" // JWT Token
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: For invalid credentials.

### 3. Get Public User Info

Retrieves basic public information for a specific user.

- **Method:** `GET`
- **Endpoint:** `/api/users/:id`
- **Success Response (200 OK):**
  ```json
  {
    "id": "string",
    "username": "string",
    "email": "string"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If the user does not exist.

### 4. Get Channel Info

Retrieves public channel information for a specific user, including their stream details.

- **Method:** `GET`
- **Endpoint:** `/api/users/:id/channel`
- **Success Response (200 OK):**
  ```json
  {
    "user": {
        "id": "string",
        "username": "string",
        "email": "string"
    },
    "stream": {
        "id": "string",
        "title": "string",
        "description": "string",
        "isLive": boolean
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If the user or stream does not exist.

### 5. Get My Channel Info

Retrieves the authenticated user's own channel information, including the private stream key.

- **Method:** `GET`
- **Endpoint:** `/api/users/me/channel`
- **Authentication:** Required.
- **Success Response (200 OK):**
  ```json
  {
    "user": { ... },
    "stream": { ... } // Includes streamKey
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: If the token is missing or invalid.
  - `404 Not Found`: If the user or stream does not exist.

---

## Streams

### 1. Get Live Streams

Retrieves a list of all currently live streams.

- **Method:** `GET`
- **Endpoint:** `/api/streams`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": "string",
      "userId": "string",
      "title": "string",
      "description": "string",
      "isLive": true,
      "thumbnailUrl": "string | null"
    }
  ]
  ```

---

## VODs (Videos on Demand)

### 1. Get VODs by Channel

Retrieves a list of all VODs for a specific channel (user).

- **Method:** `GET`
- **Endpoint:** `/api/vods/channel/:channelId`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": "string",
      "userId": "string",
      "streamId": "string",
      "title": "string",
      "videoUrl": "string",
      "thumbnailUrl": "string",
      "views": number,
      "duration": number,
      "createdAt": "string (ISO 8601)"
    }
  ]
  ```

### 2. Get VOD by ID

Retrieves a specific VOD by its ID.

- **Method:** `GET`
- **Endpoint:** `/api/vods/:vodId`
- **Success Response (200 OK):**
  ```json
  {
    "id": "string",
    // ... all other VOD fields
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If the VOD does not exist.

---

## Webhooks

### 1. Media Server Webhook

An internal endpoint for the media server (e.g., Node-Media-Server) to notify the application when a stream starts or stops.

- **Method:** `POST`
- **Endpoint:** `/api/streams/webhooks`
- **Request Body:**
  ```json
  {
    "streamKey": "string",
    "event": "post_publish" // or "done_publish"
  }
  ```
- **Success Response (200 OK or 204 No Content):** The server responds with a success status but no specific body content is guaranteed.
