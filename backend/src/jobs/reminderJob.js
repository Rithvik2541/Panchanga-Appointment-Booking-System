/**
 * Reminder Job
 * Sends email reminders 15 minutes before appointments
 * Runs every 1 minute to check for upcoming appointments
 */

const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { sendReminderMail } = require('../services/mailService');
const { STATUSES, REMINDER_BEFORE_MINUTES } = require('../utils/constants');

/**
 * Check for appointments needing reminders and send emails
 */
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + REMINDER_BEFORE_MINUTES * 60 * 1000);

    // Find appointments that:
    // 1. Are CONFIRMED
    // 2. Haven't had reminder sent yet
    // 3. Start time is between now and now + 15 minutes
    const appointments = await Appointment.find({
      status: STATUSES.CONFIRMED,
      reminderSent: false,
      slotStart: {
        $gte: now,
        $lte: reminderWindow,
      },
    }).populate('userId', 'username mail');

    console.log(`📧 Checking reminders: Found ${appointments.length} appointments needing reminders`);

    for (const appointment of appointments) {
      try {
        // Send reminder email
        await sendReminderMail(
          appointment.userMail,
          appointment.username,
          appointment
        );

        // Mark reminder as sent
        appointment.reminderSent = true;
        await appointment.save();

        console.log(`✅ Reminder sent for appointment ${appointment._id} to ${appointment.userMail}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for appointment ${appointment._id}:`, error.message);
        // Continue with next appointment even if one fails
      }
    }
  } catch (error) {
    console.error('❌ Error in reminder job:', error.message);
  }
};

/**
 * Start the reminder cron job
 * Runs daily at midnight IST (00:00 IST = 18:30 UTC previous day)
 */
const startReminderJob = () => {
  // Schedule: Daily at 00:00 IST (18:30 UTC)
  // Cron format: minute hour day month weekday
  // 30 18 * * * = 18:30 UTC = 00:00 IST (next day)
  cron.schedule('30 18 * * *', async () => {
    console.log('⏰ Running daily reminder job at midnight IST...');
    await checkAndSendReminders();
  }, {
    timezone: 'UTC'
  });

  console.log('✅ Reminder job scheduled (runs daily at 00:00 IST)');
};

module.exports = {
  startReminderJob,
  checkAndSendReminders,
};
