/**
 * Server Entry Point
 * Creates HTTP server, attaches Socket.IO, and starts the application
 */

const http = require('http');
const { Server } = require('socket.io'); 
const app = require('./app');
const connectDB = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');
const { initChatSocket } = require('./sockets/chatSocket'); 
const { startReminderJob } = require('./jobs/reminderJob');
const { startCleanupJob } = require('./jobs/cleanupJob'); 

/** 
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    
    // TODO: Make sure to configure your MongoDB URI in the .env file
    // Example: MONGO_URI=mongodb://localhost:27017/appointment-booking
    // Or for MongoDB Atlas: MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/appointment-booking

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize chat socket handlers
    initChatSocket(io);

    // Start cron jobs
    console.log('⏰ Starting scheduled jobs...');
    startReminderJob();
    startCleanupJob();

    // Start server
    const port = PORT || 5000;
    server.listen(port, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${port}`);
      console.log(`📡 API Base URL: http://localhost:${port}`);
      console.log(`🔌 Socket.IO: Enabled`);
      console.log(`💾 Database: Connected`);
      console.log('📌 API Endpoints:');
      console.log(`   Health Check:     GET  http://localhost:${port}/health`);
      console.log(`   Register:         POST http://localhost:${port}/api/auth/register`);
      console.log(`   Verify OTP:       POST http://localhost:${port}/api/auth/verify-otp`);
      console.log(`   Login:            POST http://localhost:${port}/api/auth/login`);
      console.log(`   All Consultants:  GET  http://localhost:${port}/api/consultants`);
      console.log(`   Get Consultant:   GET  http://localhost:${port}/api/consultants/:id`);
      console.log(`   My Appointments:  GET  http://localhost:${port}/api/appointments/my`);
      console.log(`   Book Appt:        POST http://localhost:${port}/api/appointments`);
      console.log(`   Cancel Appt:      PATCH http://localhost:${port}/api/appointments/:id/cancel`);
      console.log(`   Admin Appts:      GET  http://localhost:${port}/api/admin/appointments`);
      console.log(`   Update Status:    PATCH http://localhost:${port}/api/admin/appointments/:id`);

    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
