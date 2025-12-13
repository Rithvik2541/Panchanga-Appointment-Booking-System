/**
 * Cleanup Job
 * 1. Auto-marks CONFIRMED appointments as COMPLETED after they end
 * 2. Deletes old COMPLETED appointments (30 days retention)
 * Runs every 10 minutes
 */

const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { STATUSES, COMPLETED_RETENTION_DAYS } = require('../utils/constants');

/**
 * Mark appointments as COMPLETED if their end time has passed
 */
const markCompletedAppointments = async () => {
  try {
    const now = new Date();

    // Find appointments that are CONFIRMED but have already ended
    const result = await Appointment.updateMany(
      {
        status: STATUSES.CONFIRMED,
        slotEnd: { $lt: now },
      },
      {
        $set: { status: STATUSES.COMPLETED },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Marked ${result.modifiedCount} appointments as COMPLETED`);
    }
  } catch (error) {
    console.error('❌ Error marking completed appointments:', error.message);
  }
};

/**
 * Delete old COMPLETED appointments (older than 30 days)
 */
const deleteOldCompletedAppointments = async () => {
  try {
    const now = new Date();
    const retentionDate = new Date(now.getTime() - COMPLETED_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // Delete appointments that are COMPLETED and ended more than 30 days ago
    const result = await Appointment.deleteMany({
      status: STATUSES.COMPLETED,
      slotEnd: { $lt: retentionDate },
    });

    if (result.deletedCount > 0) {
      console.log(`🗑️  Deleted ${result.deletedCount} old completed appointments`);
    }
  } catch (error) {
    console.error('❌ Error deleting old appointments:', error.message);
  }
};

/**
 * Run both cleanup tasks
 */
const runCleanupTasks = async () => {
  console.log('🧹 Running cleanup job...');
  await markCompletedAppointments();
  await deleteOldCompletedAppointments();
};

/**
 * Start the cleanup cron job
 * Runs daily at midnight IST (00:00 IST = 18:30 UTC previous day)
 */
const startCleanupJob = () => {
  // Schedule: Daily at 00:00 IST (18:30 UTC)
  // Cron format: minute hour day month weekday
  // 30 18 * * * = 18:30 UTC = 00:00 IST (next day)
  cron.schedule('30 18 * * *', async () => {
    await runCleanupTasks();
  }, {
    timezone: 'UTC'
  });

  console.log('✅ Cleanup job scheduled (runs daily at 00:00 IST)');
};

module.exports = {
  startCleanupJob,
  runCleanupTasks,
};
