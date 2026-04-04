import React from 'react';
import { LayoutDashboard, Users, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: 'metrics' | 'clients' | 'settings';
  setActiveTab: (tab: 'metrics' | 'clients' | 'settings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'metrics', label: 'Metrics', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-50 flex items-center justify-around md:justify-center md:gap-12 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all relative py-1",
            activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div 
              layoutId="activeTab"
              className="absolute -top-3 left-0 right-0 h-1 bg-indigo-600 rounded-full"
            />
          )}
        </button>
      ))}
    </nav>
  );
};
