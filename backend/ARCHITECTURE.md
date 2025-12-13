# System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     APPOINTMENT BOOKING SYSTEM                       │
│                        Node.js + Express Backend                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
├──────────────────────────────────────────────────────────────────────┤
│  HTTP Requests          WebSocket Connection                         │
│  (REST API)             (Socket.IO + JWT)                           │
│     ↓                          ↓                                     │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│                      SERVER ENTRY POINT                              │
├──────────────────────────────────────────────────────────────────────┤
│  server.js                                                           │
│  ├─ Creates HTTP Server                                             │
│  ├─ Attaches Socket.IO                                              │
│  ├─ Connects to MongoDB                                             │
│  └─ Starts Cron Jobs                                                │
└──────────────────────────────────────────────────────────────────────┘
                    ↓                           ↓
       ┌────────────────────────┐    ┌────────────────────────┐
       │    EXPRESS APP         │    │    SOCKET.IO           │
       │    (app.js)            │    │    (chatSocket.js)     │
       └────────────────────────┘    └────────────────────────┘
                    ↓                           ↓
┌──────────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE LAYER                              │
├──────────────────────────────────────────────────────────────────────┤
│  • CORS                                                              │
│  • Body Parser (JSON)                                               │
│  • JWT Authentication (auth.js)                                     │
│  • Role-Based Access Control (roles.js)                            │
│  • Error Handler (errorHandler.js)                                 │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│                          ROUTE LAYER                                 │
├──────────────────────────────────────────────────────────────────────┤
│  /api/auth/*          → authRoutes.js                               │
│  /api/appointments/*  → appointmentRoutes.js                        │
│  /api/admin/*         → adminRoutes.js                              │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│                       CONTROLLER LAYER                               │
├──────────────────────────────────────────────────────────────────────┤
│  authController.js                                                   │
│  ├─ register()       → Validate input                               │
│  ├─ verifyOtp()      → Call service                                 │
│  └─ login()          → Return response                              │
│                                                                      │
│  appointmentController.js                                            │
│  ├─ createAppointment()                                             │
│  ├─ getMyAppointments()                                             │
│  └─ cancelAppointment()                                             │
│                                                                      │
│  adminController.js                                                  │
│  ├─ getAppointments()                                               │
│  └─ updateAppointmentStatus()                                       │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                 │
│                      (Business Logic)                                │
├──────────────────────────────────────────────────────────────────────┤
│  authService.js                                                      │
│  ├─ register()       → Hash password, generate OTP, send email      │
│  ├─ verifyOtp()      → Validate OTP, mark verified                 │
│  └─ login()          → Verify credentials, generate JWT            │
│                                                                      │
│  appointmentService.js                                               │
│  ├─ createAppointment()     → Validate business rules              │
│  │   • Check working hours (10-18, Mon-Fri)                        │
│  │   • Check user limit (max 3/day)                                │
│  │   • Check slot availability                                     │
│  │   • Prevent overlaps                                            │
│  ├─ getAppointmentsForUser()                                        │
│  ├─ getAppointmentsForAdmin()                                       │
│  ├─ cancelAppointmentByUser()                                       │
│  └─ updateAppointmentStatusByAdmin()                                │
│                                                                      │
│  mailService.js                                                      │
│  ├─ sendOtpMail()                                                   │
│  ├─ sendReminderMail()                                              │
│  └─ sendCompletedMail()                                             │
│                                                                      │
│  chatService.js                                                      │
│  └─ saveChatMessage() (optional)                                    │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│                        MODEL LAYER                                   │
│                     (Database Schema)                                │
├──────────────────────────────────────────────────────────────────────┤
│  Hero.js (Users/Admins/Consultants)                                 │
│  ├─ mail (unique)                                                   │
│  ├─ username                                                        │
│  ├─ hashedPassword                                                  │
│  ├─ role (USER/ADMIN/CONSULTANT)                                   │
│  ├─ otpCode & otpExpiresAt                                         │
│  └─ isVerified                                                      │
│                                                                      │
│  Appointment.js                                                      │
│  ├─ userId, consultantId (references)                              │
│  ├─ appointmentDate (normalized)                                    │
│  ├─ appointmentTime (HH:mm)                                         │
│  ├─ slotStart, slotEnd (Date)                                      │
│  ├─ status (PENDING/CONFIRMED/CANCELLED/COMPLETED)                 │
│  ├─ reminderSent (Boolean)                                          │
│  └─ Indexes:                                                        │
│      • Unique: (consultantId, slotStart) for non-cancelled         │
│      • Index: (appointmentDate, consultantId)                      │
│      • Index: (userId, appointmentDate)                            │
│      • Index: (status, reminderSent, slotStart)                    │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│                          DATABASE                                    │
├──────────────────────────────────────────────────────────────────────┤
│  MongoDB (via Mongoose)                                              │
│  └─ appointment-booking database                                     │
│      ├─ heroes collection                                           │
│      └─ appointments collection                                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      BACKGROUND JOBS                                 │
├──────────────────────────────────────────────────────────────────────┤
│  reminderJob.js (runs every 1 minute)                               │
│  ├─ Find CONFIRMED appointments starting in 15 mins                │
│  ├─ Send reminder email                                             │
│  └─ Mark reminderSent = true                                        │
│                                                                      │
│  cleanupJob.js (runs every 10 minutes)                              │
│  ├─ Mark CONFIRMED → COMPLETED (after end time)                    │
│  └─ Delete COMPLETED appointments older than 30 days               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       UTILITY LAYER                                  │
├──────────────────────────────────────────────────────────────────────┤
│  otpUtils.js           → generateOtp() (6 digits)                   │
│  timeUtils.js          → Time validation, slot helpers              │
│  emailTemplates.js     → HTML email templates                       │
│  constants.js          → App-wide constants                         │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                │
├──────────────────────────────────────────────────────────────────────┤
│  • SMTP Server (nodemailer)    → OTP & Reminder Emails             │
│  • MongoDB Server               → Data Persistence                  │
└──────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
                          DATA FLOW EXAMPLES
═══════════════════════════════════════════════════════════════════════

1. USER REGISTRATION FLOW
   ──────────────────────
   Client → POST /api/auth/register
   → authController.register()
   → authService.register()
      ├─ Check if email exists
      ├─ Hash password (bcrypt)
      ├─ Generate OTP (6 digits)
      ├─ Save user with OTP & expiry
      └─ mailService.sendOtpMail()
         └─ Send email via SMTP
   → Return success message
   → Client receives OTP in email

2. APPOINTMENT BOOKING FLOW
   ────────────────────────
   Client → POST /api/appointments (with JWT)
   → auth middleware (verify JWT)
   → checkRole(['USER'])
   → appointmentController.createAppointment()
   → appointmentService.createAppointment()
      ├─ Validate time slot (Mon-Fri, 10-18, 30-min slots)
      ├─ Check user limit (max 3/day)
      ├─ Check consultant availability
      ├─ Prevent overlaps (unique index)
      └─ Create appointment (status: PENDING)
   → Return created appointment
   → Admin can later CONFIRM it

3. REAL-TIME CHAT FLOW
   ───────────────────
   Client → Connect to Socket.IO (with JWT in auth)
   → chatSocket.js middleware (verify JWT)
   → socket.join(userId)  // Join personal room
   → Client emits 'send_message' { toUserId, message }
   → Server validates and forwards
   → io.to(toUserId).emit('receive_message', data)
   → Recipient receives message instantly

4. AUTOMATED REMINDER FLOW
   ───────────────────────
   Cron Job (every 1 minute)
   → reminderJob.checkAndSendReminders()
      ├─ Find CONFIRMED appointments
      ├─ Where slotStart is in next 15 minutes
      ├─ Where reminderSent = false
      └─ For each:
         ├─ mailService.sendReminderMail()
         └─ Set reminderSent = true
   → Users get email 15 mins before appointment

5. STATUS WORKFLOW
   ────────────────
   PENDING ──(admin confirms)──→ CONFIRMED
      │                              │
      │                              │
      ├──(user/admin cancels)──→ CANCELLED
      │                              │
      │                              ↓
      │                         (time passes)
      │                              ↓
      └──────────────────────→ COMPLETED (auto)
                                     ↓
                              (after 30 days)
                                     ↓
                                  DELETED

═══════════════════════════════════════════════════════════════════════
