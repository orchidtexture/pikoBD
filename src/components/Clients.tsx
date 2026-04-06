import React from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, PositionState } from '../types';
import { ClientCard } from './ClientCard';

interface ClientsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredClients: Client[];
  expandedClientIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onLogConversation: (id: string) => void;
  onAddPosition: (id: string) => void;
  onDeleteClient: (id: string) => void;
  onUpdatePositionState: (clientId: string, positionId: string, newState: PositionState) => void;
  onDeletePosition: (clientId: string, positionId: string) => void;
  onDeleteConversation: (clientId: string, conversationId: string) => void;
}

export const Clients: React.FC<ClientsProps> = ({
  searchQuery,
  setSearchQuery,
  filteredClients,
  expandedClientIds,
  onToggleExpand,
  onLogConversation,
  onAddPosition,
  onDeleteClient,
  onUpdatePositionState,
  onDeletePosition,
  onDeleteConversation,
}) => {
  return (
    <motion.div
      key="clients"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Search & Filters */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input 
          type="text" 
          placeholder="Search clients or positions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all shadow-sm"
        />
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              isExpanded={expandedClientIds.has(client.id)}
              onToggleExpand={onToggleExpand}
              onLogConversation={onLogConversation}
              onAddPosition={onAddPosition}
              onDeleteClient={onDeleteClient}
              onUpdatePositionState={onUpdatePositionState}
              onDeletePosition={onDeletePosition}
              onDeleteConversation={onDeleteConversation}
            />
          ))}
        </AnimatePresence>

        {filteredClients.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No clients found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">Try adjusting your search or add a new client to get started.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
