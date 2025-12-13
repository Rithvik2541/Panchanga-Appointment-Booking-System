# Testing Guide

Complete testing guide for the Appointment Booking System backend.

## Prerequisites

1. Server is running: `npm start`
2. MongoDB is connected
3. Email is configured (for OTP testing)

## Testing Tools

- **cURL** (command line)
- **Postman** (recommended GUI tool)
- **Thunder Client** (VS Code extension)
- **HTTPie** (alternative to cURL)

## 1. Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-09T..."
}
```

## 2. User Registration Flow

### Step 1: Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mail": "testuser@example.com",
    "username": "Test User",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for OTP verification code."
}
```

**Check your email for the 6-digit OTP code!**

### Step 2: Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mail": "testuser@example.com",
    "otp": "123456"
  }'
```

Replace `123456` with the actual OTP from your email.

Expected response:
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login."
}
```

### Step 3: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mail": "testuser@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "675698a1b2c3d4e5f6789012",
      "mail": "testuser@example.com",
      "username": "Test User",
      "role": "USER"
    }
  }
}
```

**Save the token** - you'll need it for authenticated requests!

## 3. Create Admin and Consultant Users

Before testing appointments, you need consultants.

### Register another user (for consultant)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mail": "consultant@example.com",
    "username": "Dr. Smith",
    "password": "password123"
  }'
```

Verify OTP and then **manually update role in MongoDB:**

```javascript
// In MongoDB shell or Compass
use appointment-booking

// Make the user a consultant
db.heroes.updateOne(
  { mail: "consultant@example.com" },
  { $set: { role: "CONSULTANT" } }
)

// Create an admin user
db.heroes.updateOne(
  { mail: "admin@example.com" },  // Register this user first!
  { $set: { role: "ADMIN" } }
)
```

**Get the consultant's ID** (you'll need it for booking):

```javascript
db.heroes.findOne({ mail: "consultant@example.com" })
// Copy the _id field
```

## 4. Book an Appointment

Use the USER token from step 2.

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE" \
  -d '{
    "consultantId": "CONSULTANT_MONGODB_ID_HERE",
    "appointmentDate": "2025-12-16",
    "appointmentTime": "14:30"
  }'
```

Replace:
- `YOUR_USER_TOKEN_HERE` with the JWT from login
- `CONSULTANT_MONGODB_ID_HERE` with the consultant's MongoDB _id
- Date must be a future weekday (Monday-Friday)
- Time must be HH:mm format, between 10:00-17:30

Expected response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "Test User",
    "userMail": "testuser@example.com",
    "userId": "...",
    "consultantId": {
      "_id": "...",
      "username": "Dr. Smith",
      "mail": "consultant@example.com"
    },
    "appointmentDate": "2025-12-16T00:00:00.000Z",
    "appointmentTime": "14:30",
    "slotStart": "2025-12-16T14:30:00.000Z",
    "slotEnd": "2025-12-16T15:00:00.000Z",
    "status": "PENDING",
    "reminderSent": false,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Appointment created successfully"
}
```

## 5. Get My Appointments

```bash
curl -X GET http://localhost:5000/api/appointments/my \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "username": "Test User",
      "consultantId": {
        "username": "Dr. Smith",
        "mail": "consultant@example.com"
      },
      "appointmentDate": "2025-12-16T00:00:00.000Z",
      "appointmentTime": "14:30",
      "status": "PENDING",
      ...
    }
  ]
}
```

## 6. Admin: View All Appointments

Login as admin first, then:

```bash
# Get all appointments
curl -X GET http://localhost:5000/api/admin/appointments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# Filter by date
curl -X GET "http://localhost:5000/api/admin/appointments?date=2025-12-16" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# Filter by status
curl -X GET "http://localhost:5000/api/admin/appointments?status=PENDING" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# Multiple filters
curl -X GET "http://localhost:5000/api/admin/appointments?date=2025-12-16&status=PENDING&consultantId=CONSULTANT_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## 7. Admin: Confirm Appointment

```bash
curl -X PATCH http://localhost:5000/api/admin/appointments/APPOINTMENT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "status": "CONFIRMED"
  }'
```

Replace `APPOINTMENT_ID_HERE` with the actual appointment _id.

Expected response:
```json
{
  "success": true,
  "data": {
    ...appointment with status: "CONFIRMED"
  },
  "message": "Appointment status updated to CONFIRMED"
}
```

## 8. Test Appointment Cancellation

### As User:

```bash
curl -X PATCH http://localhost:5000/api/appointments/APPOINTMENT_ID_HERE/cancel \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "data": {
    ...appointment with status: "CANCELLED"
  },
  "message": "Appointment cancelled successfully"
}
```

## 9. Test Business Rules

### Test 1: Invalid Time Slot (not 30-min interval)

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE" \
  -d '{
    "consultantId": "CONSULTANT_ID",
    "appointmentDate": "2025-12-16",
    "appointmentTime": "14:15"
  }'
```

Expected: Error about invalid time (must be :00 or :30)

### Test 2: Weekend Appointment

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE" \
  -d '{
    "consultantId": "CONSULTANT_ID",
    "appointmentDate": "2025-12-14",
    "appointmentTime": "14:00"
  }'
```

Expected: Error (weekends not allowed)

### Test 3: Outside Working Hours

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE" \
  -d '{
    "consultantId": "CONSULTANT_ID",
    "appointmentDate": "2025-12-16",
    "appointmentTime": "09:00"
  }'
```

Expected: Error (before 10:00)

### Test 4: Double Booking (Overlap)

Book an appointment, then try to book the same slot again:

Expected: Error about slot already booked

### Test 5: Max Appointments Per Day

Try to book 4 appointments on the same day:

Expected: Error after the 3rd appointment

## 10. Test Socket.IO Chat

### Using JavaScript Client

```javascript
// Install socket.io-client: npm install socket.io-client
const io = require('socket.io-client');

// Connect with JWT token
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  }
});

// Listen for connection
socket.on('connected', (data) => {
  console.log('Connected:', data);
});

// Send a message
socket.emit('send_message', {
  toUserId: 'RECIPIENT_USER_ID',
  message: 'Hello, this is a test message!',
  appointmentId: 'OPTIONAL_APPOINTMENT_ID'
});

// Receive messages
socket.on('receive_message', (data) => {
  console.log('New message from:', data.fromUsername);
  console.log('Message:', data.message);
  console.log('Timestamp:', data.timestamp);
});

// Confirmation
socket.on('message_sent', (data) => {
  console.log('Message sent successfully!');
});

// Errors
socket.on('error', (error) => {
  console.error('Error:', error);
});
```

### Test Typing Indicators

```javascript
// Send typing indicator
socket.emit('typing', { toUserId: 'RECIPIENT_USER_ID' });

// Listen for typing
socket.on('user_typing', (data) => {
  console.log(`${data.username} is typing...`);
});

// Stop typing
socket.emit('stop_typing', { toUserId: 'RECIPIENT_USER_ID' });
```

## 11. Test Automated Jobs

### Test Reminder Job

1. Create a CONFIRMED appointment starting in 16 minutes
2. Wait for the next minute
3. Check server logs - should see reminder sent
4. Check email for reminder

### Test Cleanup Job

1. Manually set an appointment's slotEnd to the past:
   ```javascript
   db.appointments.updateOne(
     { _id: ObjectId("APPOINTMENT_ID") },
     { 
       $set: { 
         status: "CONFIRMED",
         slotEnd: new Date(Date.now() - 1000) // 1 second ago
       } 
     }
   )
   ```
2. Wait up to 10 minutes for cleanup job
3. Check server logs - should see "Marked X appointments as COMPLETED"
4. Verify in MongoDB that status changed to COMPLETED

## 12. Test Error Handling

### Invalid JWT

```bash
curl -X GET http://localhost:5000/api/appointments/my \
  -H "Authorization: Bearer invalid_token"
```

Expected: 401 Unauthorized

### Missing Required Fields

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"mail": "test@example.com"}'
```

Expected: 400 Bad Request (missing username and password)

### Non-existent Endpoint

```bash
curl http://localhost:5000/api/nonexistent
```

Expected: 404 Not Found

## Postman Collection

You can import this JSON into Postman:

```json
{
  "info": {
    "name": "Appointment Booking API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/register",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"mail\": \"test@example.com\",\n  \"username\": \"Test User\",\n  \"password\": \"password123\"\n}"
            }
          }
        },
        {
          "name": "Verify OTP",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/verify-otp",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"mail\": \"test@example.com\",\n  \"otp\": \"123456\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/login",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"mail\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

## Success Checklist

- [ ] Server starts without errors
- [ ] MongoDB connected successfully
- [ ] Health check returns 200 OK
- [ ] User registration works
- [ ] OTP email received
- [ ] OTP verification works
- [ ] Login returns JWT token
- [ ] Consultant user created in MongoDB
- [ ] Appointment booking succeeds
- [ ] Business rules enforced (time slots, limits, etc.)
- [ ] Admin can view all appointments
- [ ] Admin can confirm appointments
- [ ] User can cancel appointments
- [ ] Socket.IO chat connects with JWT
- [ ] Messages sent and received in real-time
- [ ] Reminder job logs activity
- [ ] Cleanup job logs activity

## Troubleshooting

**Problem:** "Authentication error" in logs  
**Solution:** Check JWT_SECRET in .env, ensure token is valid

**Problem:** "MongoDB connection failed"  
**Solution:** Check MONGO_URI in .env, ensure MongoDB is running

**Problem:** "Error sending OTP email"  
**Solution:** Check SMTP credentials in .env, use App Password for Gmail

**Problem:** 404 on all endpoints  
**Solution:** Ensure routes are properly mounted in app.js

**Problem:** Socket.IO connection rejected  
**Solution:** Verify JWT token is passed in auth parameter

---

Happy Testing! 🎉
