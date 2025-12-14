# Appointment Booking System - Backend

A complete Node.js + Express + MongoDB backend for an appointment booking system with OTP-based registration, email notifications, and real-time chat functionality.

## Features

✅ **User Authentication**
- OTP-based email verification
- JWT authentication
- Role-based access control (USER, ADMIN, CONSULTANT)
- Password hashing with bcrypt

✅ **Appointment Management**
- Book appointments with consultants
- 30-minute time slots (10:00-18:00, Mon-Fri)
- Max 3 appointments per user per day
- Prevent overlapping appointments
- Status management (PENDING, CONFIRMED, CANCELLED, COMPLETED)

✅ **Email Notifications**
- OTP verification emails
- 15-minute appointment reminders
- Appointment completion notifications

✅ **Real-time Chat**
- Socket.IO-based chat
- JWT-authenticated connections
- Direct messaging between users, admins, and consultants
- Typing indicators

✅ **Automated Tasks**
- Auto-send reminders 15 minutes before appointments
- Auto-mark appointments as COMPLETED
- Auto-delete old completed appointments (30-day retention)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcrypt
- **Email:** Nodemailer
- **Scheduling:** node-cron
- **Real-time:** Socket.IO
- **Environment:** dotenv

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── env.js             # Environment variables
│   │   └── mailer.js          # Nodemailer configuration
│   ├── models/
│   │   ├── Hero.js            # Users/Admins/Consultants model
│   │   └── Appointment.js     # Appointments model
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── roles.js           # Role-based access control
│   │   └── errorHandler.js    # Global error handler
│   ├── utils/
│   │   ├── otpUtils.js        # OTP generation
│   │   ├── timeUtils.js       # Time slot helpers
│   │   ├── emailTemplates.js  # Email templates
│   │   └── constants.js       # App constants
│   ├── services/
│   │   ├── authService.js     # Authentication logic
│   │   ├── appointmentService.js # Appointment logic
│   │   ├── mailService.js     # Email sending
│   │   └── chatService.js     # Chat helpers
│   ├── controllers/
│   │   ├── authController.js  # Auth endpoints
│   │   ├── appointmentController.js # Appointment endpoints
│   │   └── adminController.js # Admin endpoints
│   ├── routes/
│   │   ├── authRoutes.js      # Auth routes
│   │   ├── appointmentRoutes.js # Appointment routes
│   │   └── adminRoutes.js     # Admin routes
│   ├── jobs/
│   │   ├── reminderJob.js     # Reminder cron job
│   │   └── cleanupJob.js      # Cleanup cron job
│   ├── sockets/
│   │   └── chatSocket.js      # Socket.IO chat handler
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and configure:
   # - MongoDB connection string (MONGO_URI)
   # - JWT secret (JWT_SECRET)
   # - Email SMTP credentials (MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS)
   ```

## Configuration

### MongoDB Setup

**Option 1: Local MongoDB**
```env
MONGO_URI=mongodb://localhost:27017/appointment-booking
```

**Option 2: MongoDB Atlas (Cloud)**
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/appointment-booking
```

### Email Setup

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: [Google Account Security](https://myaccount.google.com/security)
3. Use the app password in your `.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-16-char-app-password
```

**For Other Providers (SendGrid, Mailgun, etc.):**
Update the SMTP settings accordingly in `.env`.

## Running the Server

```bash
# Production mode
npm start

# Development mode
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/verify-otp` | Verify OTP code | Public |
| POST | `/api/auth/login` | Login user | Public |

### User Appointments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/appointments/my` | Get my appointments | USER |
| POST | `/api/appointments` | Book appointment | USER |
| PATCH | `/api/appointments/:id/cancel` | Cancel appointment | USER |

### Admin

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/appointments` | Get all appointments (with filters) | ADMIN |
| PATCH | `/api/admin/appointments/:id` | Update appointment status | ADMIN |

## API Usage Examples

### 1. Register a User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "mail": "user@example.com",
  "username": "John Doe",
  "password": "password123"
}
```

### 2. Verify OTP

```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "mail": "user@example.com",
  "otp": "123456"
}
```

### 3. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "mail": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "mail": "user@example.com",
      "username": "John Doe",
      "role": "USER"
    }
  }
}
```

### 4. Book Appointment

```bash
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "consultantId": "consultant_mongodb_id",
  "appointmentDate": "2025-12-15",
  "appointmentTime": "14:30"
}
```

### 5. Get My Appointments

```bash
GET /api/appointments/my
Authorization: Bearer <token>
```

### 6. Admin: Get All Appointments (with filters)

```bash
GET /api/admin/appointments?date=2025-12-15&status=CONFIRMED
Authorization: Bearer <admin_token>
```

### 7. Admin: Update Appointment Status

```bash
PATCH /api/admin/appointments/:appointmentId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

## Socket.IO Chat

### Client Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connected', (data) => {
  console.log('Connected:', data);
});
```

### Send Message

```javascript
socket.emit('send_message', {
  toUserId: 'recipient_user_id',
  message: 'Hello!',
  appointmentId: 'optional_appointment_id'
});
```

### Receive Message

```javascript
socket.on('receive_message', (data) => {
  console.log('New message:', data);
  // data: { fromUserId, fromUsername, toUserId, message, timestamp }
});
```

### Typing Indicators

```javascript
// Send typing indicator
socket.emit('typing', { toUserId: 'recipient_user_id' });

// Listen for typing
socket.on('user_typing', (data) => {
  console.log(`${data.username} is typing...`);
});

// Stop typing
socket.emit('stop_typing', { toUserId: 'recipient_user_id' });
```

## Business Rules

### Appointment Booking
- **Working Hours:** 10:00 AM - 6:00 PM (Mon-Fri)
- **Slot Duration:** 30 minutes (e.g., 10:00, 10:30, 11:00...)
- **User Limit:** Max 3 appointments per day per user
- **No Overlapping:** Same consultant cannot have overlapping appointments
- **Future Only:** Appointments must be in the future

### Status Workflow
- **PENDING** → CONFIRMED (by admin)
- **PENDING** → CANCELLED (by admin or user)
- **CONFIRMED** → CANCELLED (by admin or user)
- **CONFIRMED** → COMPLETED (auto, by system)

### Automated Tasks
- **Reminders:** Sent 15 minutes before CONFIRMED appointments
- **Auto-Complete:** CONFIRMED appointments auto-marked as COMPLETED after end time
- **Auto-Delete:** COMPLETED appointments deleted after 30 days

## Creating Admin/Consultant Users

To create admin or consultant users, manually update the `role` field in MongoDB:

```javascript
// In MongoDB shell or Compass
db.heroes.updateOne(
  { mail: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)

db.heroes.updateOne(
  { mail: "consultant@example.com" },
  { $set: { role: "CONSULTANT" } }
)
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if local)
- Check connection string format
- Verify network access (if using MongoDB Atlas)

### Email Not Sending
- Verify SMTP credentials in `.env`
- For Gmail, ensure App Password is used (not regular password)
- Check firewall/antivirus settings

### Socket.IO Connection Failed
- Ensure JWT token is valid
- Check CORS settings
- Verify server is running

## Development Notes

### TODO Comments
Look for `TODO` comments in the code for configuration points:
- `src/config/db.js` - MongoDB URI
- `src/config/mailer.js` - Email SMTP configuration
- `src/server.js` - MongoDB connection reminder

### Code Style
- Uses CommonJS (require/module.exports)
- Clear comments and function documentation
- Service layer for business logic
- Controller layer for HTTP handling
- Middleware for cross-cutting concerns

## License

ISC

## Author

rithvik
