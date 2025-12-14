import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { appointmentApi } from '../api/appointmentApi';
import { toast } from 'react-toastify';
import { Topbar } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';

export const Dashboard = () => {
  const [stats, setStats] = useState({ consultants: 0, appointments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const consultantsRes = await appointmentApi.getConsultants();
        const appointmentsRes = await appointmentApi.getAppointments();
        setStats({
          consultants: consultantsRes.data.data?.length || 0,
          appointments: appointmentsRes.data.data?.length || 0,
        });
      } catch (error) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome to Admin Portal</p>
            </div>

            {/* Stats Grid */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consultants Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Consultants</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {isLoading ? '...' : stats.consultants}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">👨‍⚕️</span>
                  </div>
                </div>
              </motion.div>

              {/* Appointments Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {isLoading ? '...' : stats.appointments}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">📅</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex gap-4">
                <a
                  href="/appointments"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition shadow-sm hover:shadow-md font-medium"
                >
                  Manage Appointments
                </a>
                <a
                  href="/chat"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition shadow-sm hover:shadow-md font-medium"
                >
                  Admin Chat
                </a>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
