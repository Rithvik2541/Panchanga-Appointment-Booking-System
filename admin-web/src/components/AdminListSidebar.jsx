import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { appointmentApi } from '../api/appointmentApi';

export const AdminListSidebar = ({ onSelectAdmin, selectedAdmin }) => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch admin users from backend
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const response = await appointmentApi.getAdminUsers();
        setAdmins(response.data.data || []);
      } catch (error) {
        console.error('Failed to load admins:', error);
        toast.error('Failed to load admins');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-white border-r border-gray-200 shadow-md flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Admin Chat</h2>
        <p className="text-xs text-gray-500 mt-1">
          {isLoading ? 'Loading...' : `${admins.length} admin${admins.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Admin List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No other admins available
          </div>
        ) : (
          admins.map((admin) => (
          <motion.button
            key={admin._id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectAdmin(admin)}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
              selectedAdmin?._id === admin._id
                ? 'bg-indigo-100 border-l-4 border-l-indigo-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                {admin.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {admin.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{admin.mail}</p>
              </div>
            </div>
          </motion.button>
        )))}
      </div>
    </motion.div>
  );
};
