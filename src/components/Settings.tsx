import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const Settings: React.FC = () => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <SettingsIcon className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
      <p className="text-slate-500 mt-2">Settings and preferences will be available here soon.</p>
    </motion.div>
  );
};
