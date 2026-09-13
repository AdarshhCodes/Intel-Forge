import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Sun, Moon } from 'lucide-react';
import { useInvestigationStore, useThemeStore } from '../../stores';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { currentCase, runAiQuery } = useInvestigationStore();
  const { theme, toggleTheme } = useThemeStore();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      runAiQuery(searchInput.trim());
      navigate('/investigation-search');
    }
  };

  return (
    <header className="bg-forge-panel border-b border-forge-border select-none z-30 px-5 py-2.5 flex items-center justify-between gap-4">
      {/* Brand & Current Case */}
      <div className="flex items-center space-x-3 shrink-0">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <div className="p-1.5 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-wider text-sm text-white font-mono">
            INTEL-FORGE
          </span>
        </div>
        <span className="text-forge-border">|</span>
        <div className="text-xs">
          <span className="text-forge-text-muted text-[10px] font-mono mr-1">CASE:</span>
          <span className="text-white font-medium">{currentCase.name.split(':')[0]}</span>
        </div>
      </div>

      {/* Quick Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-forge-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search this investigation..."
            className="w-full bg-forge-bg border border-forge-border rounded pl-8 pr-12 py-1.5 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-forge-card hover:bg-forge-panel rounded border border-forge-border text-forge-cyan hover:text-white transition"
          >
            ↵
          </button>
        </div>
      </form>

      {/* Status & Theme Toggle */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-forge-emerald bg-forge-card px-2 py-1 rounded border border-forge-border">
          <span className="w-2 h-2 rounded-full bg-forge-emerald animate-pulse" />
          <span>ONLINE</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded bg-forge-card border border-forge-border hover:bg-forge-cardHover text-forge-text-secondary hover:text-forge-cyan transition"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-forge-amber" />
          ) : (
            <Moon className="w-4 h-4 text-forge-cyan" />
          )}
        </button>
      </div>
    </header>
  );
};
