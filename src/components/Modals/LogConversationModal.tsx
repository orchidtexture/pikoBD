import React from 'react';
import { motion } from 'motion/react';
import { Zap, Tag, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Client } from '../../types';

interface LogConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | undefined;
  newConversationDate: string;
  setNewConversationDate: (date: string) => void;
  newConversationTime: string;
  setNewConversationTime: (time: string) => void;
  isNeedsCheck: boolean;
  setIsNeedsCheck: (needs: boolean) => void;
  selectedPositionIds: string[];
  togglePositionSelection: (id: string) => void;
  newConversationMemo: string;
  setNewConversationMemo: (memo: string) => void;
  onAddConversation: () => void;
}

export const LogConversationModal: React.FC<LogConversationModalProps> = ({
  isOpen,
  onClose,
  client,
  newConversationDate,
  setNewConversationDate,
  newConversationTime,
  setNewConversationTime,
  isNeedsCheck,
  setIsNeedsCheck,
  selectedPositionIds,
  togglePositionSelection,
  newConversationMemo,
  setNewConversationMemo,
  onAddConversation
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
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Log Conversation</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date" 
                value={newConversationDate}
                onChange={(e) => setNewConversationDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input 
                type="time" 
                value={newConversationTime}
                onChange={(e) => setNewConversationTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status Check Toggle */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Status Check</p>
                <p className="text-xs text-emerald-700">Did you ask about new roles?</p>
              </div>
            </div>
            <button 
              onClick={() => setIsNeedsCheck(!isNeedsCheck)}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                isNeedsCheck ? "bg-emerald-500" : "bg-slate-200"
              )}
            >
              <motion.div 
                animate={{ x: isNeedsCheck ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          {/* Position Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Related Positions
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedPositionIds.map(id => {
                const pos = client?.positions.find(p => p.id === id);
                if (!pos) return null;
                return (
                  <motion.span 
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={id} 
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-semibold"
                  >
                    {pos.title}
                    <button onClick={() => togglePositionSelection(id)} className="hover:text-indigo-800">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {client?.positions
                .filter(p => !selectedPositionIds.includes(p.id))
                .map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => togglePositionSelection(pos.id)}
                    className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-xs hover:bg-slate-100 transition-colors"
                  >
                    + {pos.title}
                  </button>
                ))
              }
              {client?.positions.length === 0 && (
                <p className="text-xs text-slate-400 italic">No positions to link.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Memo / Notes</label>
            <textarea 
              autoFocus
              rows={4}
              value={newConversationMemo}
              onChange={(e) => setNewConversationMemo(e.target.value)}
              placeholder="What did you discuss?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
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
              onClick={onAddConversation}
              className="flex-1 px-4 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Log Conversation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
