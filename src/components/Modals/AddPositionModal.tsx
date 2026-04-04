import React from 'react';
import { motion } from 'motion/react';

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPositionTitle: string;
  setNewPositionTitle: (title: string) => void;
  onAddPosition: () => void;
}

export const AddPositionModal: React.FC<AddPositionModalProps> = ({
  isOpen,
  onClose,
  newPositionTitle,
  setNewPositionTitle,
  onAddPosition
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Add Position</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Position Title</label>
            <input 
              autoFocus
              type="text" 
              value={newPositionTitle}
              onChange={(e) => setNewPositionTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onAddPosition}
              className="flex-1 px-4 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Add Position
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
