import React, { useState, useEffect } from 'react';
import { Topbar } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import { AdminListSidebar } from '../components/AdminListSidebar';
import { ChatPanel } from '../components/ChatPanel';

export const Chat = () => {
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Admin List Sidebar */}
          <AdminListSidebar
            onSelectAdmin={setSelectedAdmin}
            selectedAdmin={selectedAdmin}
          />

          {/* Chat Panel */}
          {selectedAdmin ? (
            <ChatPanel className="text-black mb-2" selectedAdmin={selectedAdmin} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="text-gray-600 text-lg">
                  Select an admin to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
