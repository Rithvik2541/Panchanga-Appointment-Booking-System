/**
 * Consultant Model
 * Represents consultants in the system
 */

const mongoose = require('mongoose');

const consultantSchema = new mongoose.Schema({
  mail: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
  },
  hashedPassword: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    default: 'CONSULTANT',
  },
  otpCode: {
    type: String,
    default: null,
  },
  otpExpiresAt: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  specialization: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update updatedAt timestamp (Mongoose 9.x async version)
consultantSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Consultant', consultantSchema);
