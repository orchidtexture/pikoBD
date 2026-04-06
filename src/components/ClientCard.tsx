import React from 'react';
import { 
  Briefcase, 
  MessageSquare, 
  History, 
  Zap, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Tag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
import { Client, PositionState } from '../types';
import { Badge } from './Badge';
import { STATE_COLORS } from '../constants';

interface ClientCardProps {
  client: Client;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onLogConversation: (id: string) => void;
  onAddPosition: (id: string) => void;
  onDeleteClient: (id: string) => void;
  onUpdatePositionState: (clientId: string, positionId: string, newState: PositionState) => void;
  onDeletePosition: (clientId: string, positionId: string) => void;
  onDeleteConversation: (clientId: string, conversationId: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  isExpanded,
  onToggleExpand,
  onLogConversation,
  onAddPosition,
  onDeleteClient,
  onUpdatePositionState,
  onDeletePosition,
  onDeleteConversation,
}) => {
  const lastNeedsCheck = client.conversations.find(conv => conv.isNeedsCheck);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group transition-colors duration-300"
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg md:text-xl shrink-0 transition-colors">
              {client.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{client.name}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {client.positions.length} Positions
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {client.conversations.length} Conversations
                </span>
                {client.lastContactedAt && (
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                    <History className="w-3 h-3" />
                    {formatDistanceToNow(new Date(client.lastContactedAt))} ago
                  </span>
                )}
                {lastNeedsCheck && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Zap className="w-3 h-3" />
                    {formatDistanceToNow(new Date(lastNeedsCheck.date))} ago
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-start">
            <button 
              onClick={() => onLogConversation(client.id)}
              className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              title="Log Conversation"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onAddPosition(client.id)}
              className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              title="Add Position"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onToggleExpand(client.id)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => onDeleteClient(client.id)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
              title="Delete Client"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Positions */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Active Positions
                  </h4>
                  <div className="space-y-3">
                    {client.positions.length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic">No positions registered yet.</p>
                    ) : (
                      client.positions.map(pos => (
                        <div key={pos.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{pos.title}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Added {format(new Date(pos.createdAt), 'MMM d, yyyy')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select 
                              value={pos.state}
                              onChange={(e) => onUpdatePositionState(client.id, pos.id, e.target.value as PositionState)}
                              className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none transition-colors cursor-pointer bg-white dark:bg-slate-900",
                                STATE_COLORS[pos.state]
                              )}
                            >
                              {Object.keys(STATE_COLORS).map(state => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => onDeletePosition(client.id, pos.id)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Conversations */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Activity History
                  </h4>
                  <div className="space-y-4">
                    {client.conversations.length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic">No conversations logged yet.</p>
                    ) : (
                      client.conversations.map(conv => (
                        <div key={conv.id} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 py-1">
                          <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 transition-colors" />
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{format(new Date(conv.date), 'MMM d, HH:mm')}</span>
                              {conv.isNeedsCheck && (
                                <Badge className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                  <Zap className="w-2 h-2" />
                                  Status Check
                                </Badge>
                              )}
                            </div>
                            <button 
                              onClick={() => onDeleteConversation(client.id, conv.id)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-300 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{conv.memo}</p>
                          
                          {/* Related Positions in History */}
                          {conv.positionIds && conv.positionIds.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {conv.positionIds.map(posId => {
                                const pos = client.positions.find(p => p.id === posId);
                                if (!pos) return null;
                                return (
                                  <span key={posId} className="flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-[9px] font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                    <Tag className="w-2 h-2" />
                                    {pos.title}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
