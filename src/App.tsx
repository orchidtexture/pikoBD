import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  LayoutDashboard,
  Users,
  Settings as SettingsIcon
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { format, isSameWeek } from 'date-fns';
import { Client, Position, PositionState, Conversation } from './types';
import { STORAGE_KEY } from './constants';
import { Navbar } from './components/Navbar';
import { Metrics } from './components/Metrics';
import { Clients } from './components/Clients';
import { Settings } from './components/Settings';
import { AddClientModal } from './components/Modals/AddClientModal';
import { AddPositionModal } from './components/Modals/AddPositionModal';
import { LogConversationModal } from './components/Modals/LogConversationModal';

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
  const [activeTab, setActiveTab] = useState<'metrics' | 'clients' | 'settings'>('clients');

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8 pb-24 md:pb-24">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">PikoBD</h1>
            <p className="text-slate-500 mt-1">Manage your pipeline and stay proactive.</p>
          </div>
          {activeTab === 'clients' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAddClientOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </button>
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'metrics' && <Metrics stats={stats} />}

          {activeTab === 'clients' && (
            <Clients
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredClients={filteredClients}
              expandedClientIds={expandedClientIds}
              onToggleExpand={toggleExpandClient}
              onLogConversation={setSelectedClientIdForConversation}
              onAddPosition={setSelectedClientId}
              onDeleteClient={deleteClient}
              onUpdatePositionState={updatePositionState}
              onDeletePosition={deletePosition}
              onDeleteConversation={deleteConversation}
            />
          )}

          {activeTab === 'settings' && <Settings />}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        <AddClientModal
          isOpen={isAddClientOpen}
          onClose={() => setIsAddClientOpen(false)}
          newClientName={newClientName}
          setNewClientName={setNewClientName}
          onAddClient={addClient}
        />

        <AddPositionModal
          isOpen={!!selectedClientId}
          onClose={() => setSelectedClientId(null)}
          newPositionTitle={newPositionTitle}
          setNewPositionTitle={setNewPositionTitle}
          onAddPosition={() => selectedClientId && addPosition(selectedClientId)}
        />

        <LogConversationModal
          isOpen={!!selectedClientIdForConversation}
          onClose={() => setSelectedClientIdForConversation(null)}
          client={currentClientForConversation}
          newConversationDate={newConversationDate}
          setNewConversationDate={setNewConversationDate}
          newConversationTime={newConversationTime}
          setNewConversationTime={setNewConversationTime}
          isNeedsCheck={isNeedsCheck}
          setIsNeedsCheck={setIsNeedsCheck}
          selectedPositionIds={selectedPositionIds}
          togglePositionSelection={togglePositionSelection}
          newConversationMemo={newConversationMemo}
          setNewConversationMemo={setNewConversationMemo}
          onAddConversation={() => selectedClientIdForConversation && addConversation(selectedClientIdForConversation)}
        />
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto mt-12 pt-8 pb-32 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 PikoBD • Local Storage Mode</p>
      </footer>
    </div>
  );
}
