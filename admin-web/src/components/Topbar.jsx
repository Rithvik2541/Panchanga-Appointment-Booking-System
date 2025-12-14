import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const Topbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left - Branding */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>

        {/* Right - User Info & Logout */}
        <div className="flex items-center gap-6">
          {user && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="text-sm font-semibold text-gray-900">{user.username}</p>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium shadow-sm"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  );
};
