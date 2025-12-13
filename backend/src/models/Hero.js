/**
 * Hero Model
 * Represents users, admins, and consultants in the system
 */

const mongoose = require('mongoose'); 

const heroSchema = new mongoose.Schema({
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
    enum: ['USER', 'ADMIN', 'CONSULTANT'],
    default: 'USER',
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
heroSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Index for role-based queries
heroSchema.index({ role: 1 });

module.exports = mongoose.model('Hero', heroSchema);