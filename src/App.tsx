import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Building2, 
  Briefcase, 
  ChevronRight, 
  MoreVertical, 
  Trash2, 
  Calendar,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  History,
  ChevronDown,
  ChevronUp,
  X,
  Tag,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow, isSameWeek } from 'date-fns';
import { cn } from './lib/utils';
import { Client, Position, PositionState, Conversation } from './types';

// --- Constants & Helpers ---
const STORAGE_KEY = 'recruitflow_bd_data';

const STATE_COLORS: Record<PositionState, string> = {
  'Lead': 'bg-blue-100 text-blue-700 border-blue-200',
  'Qualified': 'bg-purple-100 text-purple-700 border-purple-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  'Filled': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Closed': 'bg-slate-100 text-slate-700 border-slate-200',
};

const STATE_ICONS: Record<PositionState, React.ReactNode> = {
  'Lead': <AlertCircle className="w-3 h-3" />,
  'Qualified': <ArrowUpRight className="w-3 h-3" />,
  'In Progress': <Clock className="w-3 h-3" />,
  'Filled': <CheckCircle2 className="w-3 h-3" />,
  'Closed': <XCircle className="w-3 h-3" />,
};

// --- Components ---

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1", className)}>
    {children}
  </span>
);

export default function App() {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Ensure conversations array exists and positionIds/isNeedsCheck exists in conversations
        return parsed.map((c: any) => ({
          ...c,
          conversations: (c.conversations || []).map((conv: any) => ({
            ...conv,
            positionIds: conv.positionIds || [],
            isNeedsCheck: conv.isNeedsCheck || false
          })),
          positions: c.positions || []
        }));
      } catch (e) {
        console.error('Failed to parse saved data', e);
        return [];
      }
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientIdForConversation, setSelectedClientIdForConversation] = useState<string | null>(null);
  const [expandedClientIds, setExpandedClientIds] = useState<Set<string>>(new Set());
  
  const [newClientName, setNewClientName] = useState('');
  const [newPositionTitle, setNewPositionTitle] = useState('');
  const [newConversationMemo, setNewConversationMemo] = useState('');
  const [newConversationDate, setNewConversationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newConversationTime, setNewConversationTime] = useState(format(new Date(), 'HH:mm'));
  const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);
  const [isNeedsCheck, setIsNeedsCheck] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  // --- Actions ---
  const toggleExpandClient = (id: string) => {
    const next = new Set(expandedClientIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedClientIds(next);
  };

  const addClient = () => {
    if (!newClientName.trim()) return;
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: newClientName,
      positions: [],
      conversations: [],
      createdAt: new Date().toISOString(),
    };
    setClients([newClient, ...clients]);
    setNewClientName('');
    setIsAddClientOpen(false);
  };

  const deleteClient = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const addPosition = (clientId: string) => {
    if (!newPositionTitle.trim()) return;
    const newPosition: Position = {
      id: crypto.randomUUID(),
      title: newPositionTitle,
      state: 'Lead',
      createdAt: new Date().toISOString(),
    };
    setClients(clients.map(c => 
      c.id === clientId 
        ? { ...c, positions: [newPosition, ...c.positions] } 
        : c
    ));
    setNewPositionTitle('');
    setSelectedClientId(null);
  };

  const addConversation = (clientId: string) => {
    if (!newConversationMemo.trim()) return;
    const dateObj = new Date(`${newConversationDate}T${newConversationTime}`);
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      memo: newConversationMemo,
      date: dateObj.toISOString(),
      positionIds: selectedPositionIds,
      isNeedsCheck: isNeedsCheck,
      createdAt: new Date().toISOString(),
    };
    setClients(clients.map(c => 
      c.id === clientId 
        ? { 
            ...c, 
            conversations: [newConversation, ...c.conversations],
            lastContactedAt: newConversation.date
          } 
        : c
    ));
    setNewConversationMemo('');
    setSelectedPositionIds([]);
    setIsNeedsCheck(false);
    setSelectedClientIdForConversation(null);
  };

  const updatePositionState = (clientId: string, positionId: string, newState: PositionState) => {
    setClients(clients.map(c => 
      c.id === clientId 
        ? { 
            ...c, 
            positions: c.positions.map(p => 
              p.id === positionId ? { ...p, state: newState } : p
            ) 
          } 
        : c
    ));
  };

  const deletePosition = (clientId: string, positionId: string) => {
    setClients(clients.map(c => 
      c.id === clientId 
        ? { ...c, positions: c.positions.filter(p => p.id !== positionId) } 
        : c
    ));
  };

  const deleteConversation = (clientId: string, conversationId: string) => {
    setClients(clients.map(c => 
      c.id === clientId 
        ? { ...c, conversations: c.conversations.filter(conv => conv.id !== conversationId) } 
        : c
    ));
  };

  const togglePositionSelection = (posId: string) => {
    setSelectedPositionIds(prev => 
      prev.includes(posId) ? prev.filter(id => id !== posId) : [...prev, posId]
    );
  };

  // --- Filtered Data ---
  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.positions.some(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, searchQuery]);

  const stats = useMemo(() => {
    const allPositions = clients.flatMap(c => c.positions);
    const now = new Date();
    const weeklyStatusChecks = clients.filter(client => 
      client.conversations.some(conv => 
        conv.isNeedsCheck && isSameWeek(new Date(conv.date), now)
      )
    ).length;

    return {
      totalClients: clients.length,
      activePositions: allPositions.filter(p => p.state !== 'Closed' && p.state !== 'Filled').length,
      filledPositions: allPositions.filter(p => p.state === 'Filled').length,
      weeklyStatusChecks,
    };
  }, [clients]);

  const currentClientForConversation = useMemo(() => 
    clients.find(c => c.id === selectedClientIdForConversation),
    [clients, selectedClientIdForConversation]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">PikoBD</h1>
            <p className="text-slate-500 mt-1">Manage your pipeline and stay proactive.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddClientOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', value: stats.totalClients, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { 
              label: 'Active Positions', 
              value: stats.activePositions, 
              icon: Briefcase, 
              color: 'text-amber-600', 
              bg: 'bg-amber-50',
              goal: 5,
              showProgress: true 
            },
            { label: 'Filled This Month', value: stats.filledPositions, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Weekly Status Checks', value: stats.weeklyStatusChecks, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                    {stat.goal && <span className="text-sm font-normal text-slate-400 ml-1">/ {stat.goal}</span>}
                  </p>
                </div>
              </div>
              
              {stat.showProgress && stat.goal && (
                <div className="space-y-1.5">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stat.value / stat.goal) * 100, 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        stat.value >= stat.goal ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                    <span>Weekly Goal Progress</span>
                    <span className={cn(stat.value >= stat.goal ? "text-emerald-600" : "text-amber-600")}>
                      {stat.value >= stat.goal ? "Goal Met!" : `${stat.goal - stat.value} more needed`}
                    </span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search clients or positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Client List */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => {
              const lastNeedsCheck = client.conversations.find(conv => conv.isNeedsCheck);
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={client.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{client.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {client.positions.length} Positions
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {client.conversations.length} Conversations
                            </span>
                            {client.lastContactedAt && (
                              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                <History className="w-3 h-3" />
                                Last: {formatDistanceToNow(new Date(client.lastContactedAt))} ago
                              </span>
                            )}
                            {lastNeedsCheck && (
                              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <Zap className="w-3 h-3" />
                                Status Check: {formatDistanceToNow(new Date(lastNeedsCheck.date))} ago
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedClientIdForConversation(client.id)}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                          title="Add Conversation"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setSelectedClientId(client.id)}
                          className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                          title="Add Position"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteClient(client.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                          title="Delete Client"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    <div className="mt-6 border-t border-slate-50 pt-4">
                      <button 
                        onClick={() => toggleExpandClient(client.id)}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {expandedClientIds.has(client.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {expandedClientIds.has(client.id) ? 'Hide Details' : 'Show Positions & Conversations'}
                      </button>

                      <AnimatePresence>
                        {expandedClientIds.has(client.id) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                              {/* Positions List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                  <Briefcase className="w-3 h-3" />
                                  Positions
                                </h4>
                                {client.positions.length === 0 ? (
                                  <p className="text-sm text-slate-400 italic py-2">No positions registered yet.</p>
                                ) : (
                                  client.positions.map((pos) => (
                                    <div 
                                      key={pos.id}
                                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group/pos"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                        <span className="font-medium text-slate-700">{pos.title}</span>
                                        <Badge className={STATE_COLORS[pos.state]}>
                                          {STATE_ICONS[pos.state]}
                                          {pos.state}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 opacity-0 group-hover/pos:opacity-100 transition-opacity">
                                        <select 
                                          value={pos.state}
                                          onChange={(e) => updatePositionState(client.id, pos.id, e.target.value as PositionState)}
                                          className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                          {(['Lead', 'Qualified', 'In Progress', 'Filled', 'Closed'] as PositionState[]).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                          ))}
                                        </select>
                                        <button 
                                          onClick={() => deletePosition(client.id, pos.id)}
                                          className="p-1 hover:text-red-600 text-slate-400"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Conversations List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                  <MessageSquare className="w-3 h-3" />
                                  Conversations
                                </h4>
                                {client.conversations.length === 0 ? (
                                  <p className="text-sm text-slate-400 italic py-2">No conversations recorded yet.</p>
                                ) : (
                                  client.conversations.map((conv) => (
                                    <div 
                                      key={conv.id}
                                      className={cn(
                                        "p-3 rounded-xl border group/conv relative",
                                        conv.isNeedsCheck ? "bg-emerald-50/50 border-emerald-100" : "bg-indigo-50/50 border-indigo-100"
                                      )}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-tight",
                                            conv.isNeedsCheck ? "text-emerald-600" : "text-indigo-600"
                                          )}>
                                            {format(new Date(conv.date), 'MMM d, yyyy • HH:mm')}
                                          </span>
                                          {conv.isNeedsCheck && (
                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                              <Zap className="w-2 h-2" />
                                              Status Check
                                            </Badge>
                                          )}
                                        </div>
                                        <button 
                                          onClick={() => deleteConversation(client.id, conv.id)}
                                          className="opacity-0 group-hover/conv:opacity-100 transition-opacity p-1 hover:text-red-600 text-slate-400"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <p className="text-sm text-slate-700 leading-relaxed">{conv.memo}</p>
                                      
                                      {/* Related Positions in History */}
                                      {conv.positionIds && conv.positionIds.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {conv.positionIds.map(posId => {
                                            const pos = client.positions.find(p => p.id === posId);
                                            if (!pos) return null;
                                            return (
                                              <span key={posId} className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-100 rounded text-[9px] font-medium text-slate-500">
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredClients.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No clients found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-1">Try adjusting your search or add a new client to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddClientOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">New Client</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsAddClientOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addClient}
                    className="flex-1 px-4 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    Create Client
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedClientId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Position</h2>
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
                    onClick={() => setSelectedClientId(null)}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => addPosition(selectedClientId)}
                    className="flex-1 px-4 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    Add Position
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedClientIdForConversation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Log Conversation</h2>
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
                      const pos = currentClientForConversation?.positions.find(p => p.id === id);
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
                    {currentClientForConversation?.positions
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
                    {currentClientForConversation?.positions.length === 0 && (
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
                    onClick={() => {
                      setSelectedClientIdForConversation(null);
                      setSelectedPositionIds([]);
                      setIsNeedsCheck(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => addConversation(selectedClientIdForConversation!)}
                    className="flex-1 px-4 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    Log Conversation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 PikoBD • Local Storage Mode</p>
      </footer>
    </div>
  );
}
