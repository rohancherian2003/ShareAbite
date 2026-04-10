# Food Waste Reduction Platform - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor" // or "receiver"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "userId": 1,
  "needsApproval": true
}
```

### Login

**POST** `/auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "donor"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor"
  }
}
```

### Get Current User

**GET** `/auth/me` 🔒

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "donor",
  "approved": true
}
```

---

## Restaurant Endpoints (Donor)

### Register Restaurant

**POST** `/donations/restaurant` 🔒

**Body:**

```json
{
  "name": "Pizza Palace",
  "type": "restaurant",
  "address": "123 Main St, City, 12345",
  "phone": "+91 1234567890",
  "email": "contact@pizzapalace.com"
}
```

**Response:**

```json
{
  "message": "Restaurant registered successfully",
  "restaurantId": 1
}
```

### Get My Restaurant

**GET** `/donations/restaurant` 🔒

**Response:**

```json
{
  "id": 1,
  "user_id": 1,
  "name": "Pizza Palace",
  "type": "restaurant",
  "address": "123 Main St, City, 12345",
  "phone": "+91 1234567890",
  "email": "contact@pizzapalace.com",
  "created_at": "2024-02-07T10:00:00.000Z"
}
```

---

## Donation Endpoints

### Create Donation

**POST** `/donations` 🔒

**Body:**

```json
{
  "foodName": "Pizza Slices",
  "quantity": "10 pieces",
  "expiryTime": "2 hours",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:**

```json
{
  "message": "Donation created successfully",
  "donationId": 1
}
```

### Get All Available Donations

**GET** `/donations`

**Response:**

```json
[
  {
    "id": 1,
    "donor_id": 1,
    "restaurant_id": 1,
    "food_name": "Pizza Slices",
    "quantity": "10 pieces",
    "expiry_time": "2 hours",
    "image_url": "https://example.com/image.jpg",
    "status": "available",
    "donor_name": "Pizza Palace",
    "location": "123 Main St, City, 12345",
    "donor_phone": "+91 1234567890",
    "created_at": "2024-02-07T10:00:00.000Z"
  }
]
```

### Get My Donations

**GET** `/donations/my-donations` 🔒

**Response:**

```json
[
  {
    "id": 1,
    "donor_id": 1,
    "restaurant_id": 1,
    "food_name": "Pizza Slices",
    "quantity": "10 pieces",
    "expiry_time": "2 hours",
    "status": "available",
    "created_at": "2024-02-07T10:00:00.000Z"
  }
]
```

### Update Donation

**PUT** `/donations/:id` 🔒

**Body:**

```json
{
  "foodName": "Pizza Slices",
  "quantity": "15 pieces",
  "expiryTime": "3 hours",
  "status": "available"
}
```

**Response:**

```json
{
  "message": "Donation updated successfully"
}
```

### Delete Donation

**DELETE** `/donations/:id` 🔒

**Response:**

```json
{
  "message": "Donation deleted successfully"
}
```

---

## Request Endpoints (Receiver)

### Create Request

**POST** `/requests` 🔒

**Body:**

```json
{
  "donationId": 1
}
```

**Response:**

```json
{
  "message": "Request created successfully",
  "requestId": 1
}
```

### Get My Requests

**GET** `/requests/my-requests` 🔒

**Response:**

```json
[
  {
    "id": 1,
    "receiver_id": 2,
    "donation_id": 1,
    "status": "pending",
    "food_name": "Pizza Slices",
    "quantity": "10 pieces",
    "expiry_time": "2 hours",
    "donor_name": "Pizza Palace",
    "created_at": "2024-02-07T10:00:00.000Z"
  }
]
```

### Update Request Status

**PUT** `/requests/:id/status` 🔒

**Body:**

```json
{
  "status": "approved" // or "rejected", "completed"
}
```

**Response:**

```json
{
  "message": "Request status updated successfully"
}
```

---

## Admin Endpoints

### Get All Users

**GET** `/admin/users` 🔒

**Response:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor",
    "approved": false,
    "created_at": "2024-02-07T10:00:00.000Z"
  }
]
```

### Approve User

**PUT** `/admin/users/:id/approve` 🔒

**Response:**

```json
{
  "message": "User approved successfully"
}
```

### Delete User

**DELETE** `/admin/users/:id` 🔒

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

### Get Statistics

**GET** `/admin/stats` 🔒

**Response:**

```json
{
  "totalDonations": 156,
  "activeDonors": 45,
  "activeReceivers": 32,
  "pendingApprovals": 8
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**

```json
{
  "message": "Error description"
}
```

**401 Unauthorized**

```json
{
  "message": "No token provided" // or "Invalid token"
}
```

**403 Forbidden**

```json
{
  "message": "Account pending approval"
}
```

**404 Not Found**

```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error**

```json
{
  "message": "Server error"
}
```

---

## Default Admin Credentials

```
Email: admin@foodwaste.com
Password: admin123
Role: admin
```
