import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import AIChatWidget from '../components/chat/AIChatWidget';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
        <AIChatWidget />
      </div>
    </div>
  );
};

export default DashboardLayout;
