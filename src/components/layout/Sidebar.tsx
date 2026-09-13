import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Search,
  Network,
  FileText,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC = () => {
  const { currentCase } = useInvestigationStore();

  const navigationItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Evidence Inbox', path: '/evidence-inbox', icon: Inbox },
    { name: 'Investigation Search', path: '/investigation-search', icon: Search },
    { name: 'Connections', path: '/connections', icon: Network },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside className="w-56 bg-forge-panel border-r border-forge-border flex flex-col justify-between select-none shrink-0 z-20">
      {/* 5-Item Navigation */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider text-forge-text-muted uppercase">
          NAVIGATION
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2.5 rounded text-xs transition font-medium ${
                  isActive
                    ? 'bg-forge-cyan/15 text-forge-cyan border-l-2 border-forge-cyan font-semibold'
                    : 'text-forge-text-secondary hover:text-white hover:bg-forge-card'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Case Status Box */}
      <div className="p-3 border-t border-forge-border bg-forge-bg/60 font-mono">
        <div className="p-2.5 rounded bg-forge-card border border-forge-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white tracking-wider">INTEL-FORGE</span>
            <span className="w-2 h-2 rounded-full bg-forge-emerald animate-pulse" />
          </div>
          <div className="text-[9px] text-forge-text-muted space-y-0.5">
            <div className="flex justify-between">
              <span>CASE:</span>
              <span className="text-white font-medium truncate max-w-[100px]">{currentCase.name.split(':')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span>STATUS:</span>
              <span className="text-forge-emerald font-semibold">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
