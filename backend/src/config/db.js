/**
 * Database Connection Configuration
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

/**
 * Connects to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // TODO: Replace process.env.MONGO_URI with your actual MongoDB connection string in .env
    // Example: MONGO_URI=mongodb://localhost:27017/appointment-booking
    // Or for MongoDB Atlas: MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/appointment-booking
    
    const conn = await mongoose.connect(MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
