# RailGo Testing Platform — API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth:** Bearer JWT token in `Authorization` header  
**Content-Type:** `application/json` (except file upload endpoints)

---

## 🔐 Authentication

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "Password123",
  "confirm_password": "Password123"
}
```

**Success Response — 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 5,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890",
      "role": "user",
      "created_at": "2024-01-15T08:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 400  | Validation failed (missing fields, email format, password too short, mismatch) |
| 409  | Email already registered |

---

### POST `/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "test@railgo.com",
  "password": "RailGo123"
}
```

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Test User",
      "email": "test@railgo.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 400  | Missing email or password |
| 401  | Invalid credentials |
| 404  | User not found |

---

### GET `/auth/me`
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "full_name": "Test User",
      "email": "test@railgo.com",
      "phone": "081234567890",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 🎫 Tickets / Train Schedules

### GET `/tickets`
Search available train schedules.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| origin | string | No | Origin city name (partial match) |
| destination | string | No | Destination city name (partial match) |
| date | string | No | Departure date (YYYY-MM-DD) |
| class | string | No | `economy`, `business`, or `executive` |
| sort | string | No | `departure_asc`, `price_asc`, `price_desc` |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10) |

**Example Request:**
```
GET /api/tickets?origin=Jakarta&destination=Bandung&date=2024-03-15&class=economy&sort=price_asc
```

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "train_name": "Argo Parahyangan",
        "train_code": "AGP-001",
        "origin": "Jakarta",
        "destination": "Bandung",
        "departure_time": "2024-03-15T06:00:00.000Z",
        "arrival_time": "2024-03-15T09:00:00.000Z",
        "duration_minutes": 180,
        "class": "economy",
        "price": 85000,
        "total_seats": 64,
        "available_seats": 42,
        "facilities": "AC, Snack"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "total_pages": 1
    }
  }
}
```

---

### GET `/tickets/:id`
Get single schedule with seat map.

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": 1,
      "train_name": "Argo Parahyangan",
      "train_code": "AGP-001",
      "origin": "Jakarta",
      "destination": "Bandung",
      "departure_time": "2024-03-15T06:00:00.000Z",
      "arrival_time": "2024-03-15T09:00:00.000Z",
      "duration_minutes": 180,
      "class": "economy",
      "price": 85000,
      "total_seats": 64,
      "available_seats": 42,
      "facilities": "AC, Snack",
      "taken_seats": ["1A", "1B", "2C", "3D"]
    }
  }
}
```

**Error:** 404 if schedule not found

---

## 📋 Bookings

### POST `/bookings`
Create a new booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "schedule_id": 1,
  "seats": ["4A", "4B"],
  "passengers": [
    {
      "name": "John Doe",
      "id_number": "3201234567890001",
      "seat": "4A"
    },
    {
      "name": "Jane Doe",
      "id_number": "3201234567890002",
      "seat": "4B"
    }
  ]
}
```

**Success Response — 201:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": 10,
      "booking_code": "RG-20240315-ABCD",
      "schedule_id": 1,
      "user_id": 1,
      "total_amount": 170000,
      "status": "pending",
      "payment_deadline": "2024-03-15T12:30:00.000Z",
      "created_at": "2024-03-15T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 400  | Missing fields, seat count mismatch |
| 404  | Schedule not found |
| 409  | One or more seats already taken |

---

### GET `/bookings`
Get all bookings for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 3,
      "confirmed": 1,
      "pending": 1,
      "cancelled": 1
    },
    "bookings": [
      {
        "id": 1,
        "booking_code": "RG-20240101-XYZ1",
        "train_name": "Argo Parahyangan",
        "origin": "Jakarta",
        "destination": "Bandung",
        "departure_time": "2024-03-20T06:00:00.000Z",
        "class": "economy",
        "total_amount": 85000,
        "status": "confirmed",
        "payment_status": "paid",
        "passenger_count": 1,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### GET `/bookings/:code`
Get booking detail by booking code.

**Headers:** `Authorization: Bearer <token>`

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": 1,
      "booking_code": "RG-20240101-XYZ1",
      "status": "confirmed",
      "total_amount": 85000,
      "payment_deadline": "2024-01-01T01:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "schedule": {
        "train_name": "Argo Parahyangan",
        "train_code": "AGP-001",
        "origin": "Jakarta",
        "destination": "Bandung",
        "departure_time": "2024-03-20T06:00:00.000Z",
        "arrival_time": "2024-03-20T09:00:00.000Z",
        "class": "economy",
        "price": 85000
      },
      "passengers": [
        {
          "id": 1,
          "name": "Test User",
          "id_number": "3201234567890001",
          "seat_number": "4A"
        }
      ],
      "payment": {
        "id": 1,
        "method": "bank_transfer",
        "status": "paid",
        "amount": 85000,
        "paid_at": "2024-01-01T00:30:00.000Z"
      }
    }
  }
}
```

---

### PUT `/bookings/:code/cancel`
Cancel a booking.

**Headers:** `Authorization: Bearer <token>`

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking_code": "RG-20240101-XYZ1",
    "status": "cancelled"
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 400  | Booking already cancelled or confirmed |
| 404  | Booking not found |

---

## 💳 Payments

### POST `/payments`
Submit payment for a booking.

**Headers:** `Authorization: Bearer <token>`  
**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| booking_code | string | Yes | Booking code |
| payment_method | string | Yes | `bank_transfer`, `e_wallet`, `credit_card` |
| payment_proof | file | Yes | Image file (JPG/PNG, max 5MB) |

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Payment submitted successfully. Awaiting verification.",
  "data": {
    "payment": {
      "id": 5,
      "booking_code": "RG-20240315-ABCD",
      "method": "bank_transfer",
      "status": "pending",
      "amount": 170000,
      "proof_url": "/uploads/proof-uuid.jpg",
      "submitted_at": "2024-03-15T12:10:00.000Z"
    }
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 400  | Missing fields, invalid method, no file, payment deadline expired |
| 404  | Booking not found |
| 409  | Payment already submitted |

---

### GET `/payments/:code`
Get payment status for a booking.

**Headers:** `Authorization: Bearer <token>`

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "booking_code": "RG-20240315-ABCD",
      "booking_status": "confirmed",
      "payment_status": "paid",
      "method": "bank_transfer",
      "amount": 170000,
      "payment_deadline": "2024-03-15T13:00:00.000Z",
      "paid_at": "2024-03-15T12:15:00.000Z"
    }
  }
}
```

---

## 🧪 QA Sandbox Endpoints

These endpoints are designed for automation testing practice.

### GET `/qa/slow-response`
Returns a successful response after a 3-second delay.

**Response — 200 (after 3s):**
```json
{
  "success": true,
  "message": "Slow response received",
  "delay_ms": 3000
}
```

---

### GET `/qa/random-fail`
Randomly returns 200 or 500.

**Success (50%) — 200:**
```json
{ "success": true, "message": "Request succeeded" }
```

**Failure (50%) — 500:**
```json
{ "success": false, "error": "Random server error occurred" }
```

---

### GET `/qa/session-expired`
Always returns 401 Unauthorized.

**Response — 401:**
```json
{
  "success": false,
  "error": "TOKEN_EXPIRED",
  "message": "Your session has expired. Please login again."
}
```

---

### POST `/qa/duplicate-submit`
Always returns 409 Conflict.

**Response — 409:**
```json
{
  "success": false,
  "error": "DUPLICATE_SUBMIT",
  "message": "This request was already submitted."
}
```

---

### GET `/qa/infinite-loading`
Never responds — times out. Use for testing timeout handling in automation.

---

## ❌ Error Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is not valid"
    }
  ]
}
```

The `errors` array is only present for validation errors (400).

---

## 🔑 Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 400  | Bad Request / Validation Error |
| 401  | Unauthorized (missing/invalid/expired token) |
| 403  | Forbidden |
| 404  | Not Found |
| 409  | Conflict (duplicate resource) |
| 500  | Internal Server Error |
