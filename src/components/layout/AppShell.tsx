import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-forge-bg text-forge-text-primary flex flex-col overflow-hidden font-sans select-none">
      {/* Top Bar */}
      <TopBar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Rail (5 items) */}
        <Sidebar />

        {/* Central Page Viewport */}
        <main className="flex-1 overflow-y-auto bg-forge-bg tactical-grid flex flex-col relative focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
