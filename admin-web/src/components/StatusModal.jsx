import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const StatusModal = ({ isOpen, appointment, onClose, onConfirm, isLoading }) => {
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(appointment._id, selectedStatus);
      setSelectedStatus('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
          >
            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Update Appointment Status
            </h2>

            {/* Appointment Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>User:</strong> {appointment?.username}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date & Time:</strong>{' '}
                {appointment?.appointmentDate} - {appointment?.appointmentTime}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Current Status:</strong>{' '}
                <span className="font-semibold">{appointment?.status}</span>
              </p>
            </div>

            {/* Status Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                New Status
              </label>
              <div className="space-y-2">
                {['CONFIRMED', 'CANCELLED'].map((status) => (
                  <label
                    key={status}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedStatus || isLoading}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 font-medium shadow-sm"
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
