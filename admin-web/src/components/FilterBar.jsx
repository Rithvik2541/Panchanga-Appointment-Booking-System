import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const FilterBar = ({ consultants, onFilter, onClear, isLoading }) => {
  const [filters, setFilters] = useState({
    date: '',
    consultantId: '',
    status: '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({ date: '', consultantId: '', status: '' });
    onClear();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 mb-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 text-gray-900"
          />
        </div>

        {/* Consultant Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consultant
          </label>
          <select
            name="consultantId"
            value={filters.consultantId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 text-gray-900"
          >
            <option value="">All Consultants</option>
            {consultants.map((c) => (
              <option key={c._id} value={c._id}>
                {c.username}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 text-gray-900"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 items-end">
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="flex-1 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 font-medium shadow-sm"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    </motion.div>
  );
};
