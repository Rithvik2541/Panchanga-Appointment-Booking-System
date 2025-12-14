import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { appointmentApi } from '../api/appointmentApi';
import { Topbar } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import { FilterBar } from '../components/FilterBar';
import { AppointmentTable } from '../components/AppointmentTable';
import { StatusModal } from '../components/StatusModal';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  // Fetch consultants on mount
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const response = await appointmentApi.getConsultants();
        setConsultants(response.data.data || []);
      } catch (error) {
        toast.error('Failed to load consultants');
      }
    };
    fetchConsultants();
  }, []);

  // Fetch appointments
  const handleFilter = async (filters) => {
    setIsLoading(true);
    try {
      const response = await appointmentApi.getAppointments(filters);
      setAppointments(response.data.data || []);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setAppointments([]);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setIsUpdating(true);
    try {
      await appointmentApi.updateStatus(appointmentId, newStatus);
      toast.success('Appointment status updated successfully');
      setShowStatusModal(false);
      setSelectedAppointment(null);
      // Refresh list
      handleFilter({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(appointments.length / itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600">Manage all appointments</p>
          </div>

          {/* Filter Bar */}
          <FilterBar
            consultants={consultants}
            onFilter={handleFilter}
            onClear={handleClear}
            isLoading={isLoading}
          />

          {/* Appointments Table */}
          <AppointmentTable
            appointments={appointments}
            isLoading={isLoading}
            onStatusClick={(apt) => {
              setSelectedAppointment(apt);
              setShowStatusModal(true);
            }}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={showStatusModal}
        appointment={selectedAppointment}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        isLoading={isUpdating}
      />
    </div>
  );
};
