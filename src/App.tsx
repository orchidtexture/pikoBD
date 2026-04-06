import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  LayoutDashboard,
  Users,
  Settings as SettingsIcon
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { format, isSameWeek } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
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
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  
  // --- Migration from localStorage ---
  useEffect(() => {
    const migrate = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const count = await db.clients.count();
          if (count === 0 && parsed.length > 0) {
            // Migration: Ensure conversations array exists and positionIds/isNeedsCheck exists in conversations
            const migratedData = parsed.map((c: any) => ({
              ...c,
              conversations: (c.conversations || []).map((conv: any) => ({
                ...conv,
                positionIds: conv.positionIds || [],
                isNeedsCheck: conv.isNeedsCheck || false
              })),
              positions: c.positions || []
            }));
            await db.clients.bulkAdd(migratedData);
            console.log('Migrated data from localStorage to IndexedDB');
            // Optional: Clear localStorage after successful migration
            // localStorage.removeItem(STORAGE_KEY);
          }
        } catch (e) {
          console.error('Failed to migrate saved data', e);
        }
      }
    };
    migrate();
  }, []);

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

  // --- Actions ---
  const toggleExpandClient = (id: string) => {
    const next = new Set(expandedClientIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedClientIds(next);
  };

  const addClient = async () => {
    if (!newClientName.trim()) return;
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: newClientName,
      positions: [],
      conversations: [],
      createdAt: new Date().toISOString(),
    };
    await db.clients.add(newClient);
    setNewClientName('');
    setIsAddClientOpen(false);
  };

  const deleteClient = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await db.clients.delete(id);
    }
  };

  const addPosition = async (clientId: string) => {
    if (!newPositionTitle.trim()) return;
    const client = await db.clients.get(clientId);
    if (!client) return;

    const newPosition: Position = {
      id: crypto.randomUUID(),
      title: newPositionTitle,
      state: 'Lead',
      createdAt: new Date().toISOString(),
    };

    await db.clients.update(clientId, {
      positions: [newPosition, ...client.positions]
    });

    setNewPositionTitle('');
    setSelectedClientId(null);
  };

  const addConversation = async (clientId: string) => {
    if (!newConversationMemo.trim()) return;
    const client = await db.clients.get(clientId);
    if (!client) return;

    const dateObj = new Date(`${newConversationDate}T${newConversationTime}`);
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      memo: newConversationMemo,
      date: dateObj.toISOString(),
      positionIds: selectedPositionIds,
      isNeedsCheck: isNeedsCheck,
      createdAt: new Date().toISOString(),
    };

    await db.clients.update(clientId, {
      conversations: [newConversation, ...client.conversations],
      lastContactedAt: newConversation.date
    });

    setNewConversationMemo('');
    setSelectedPositionIds([]);
    setIsNeedsCheck(false);
    setSelectedClientIdForConversation(null);
  };

  const updatePositionState = async (clientId: string, positionId: string, newState: PositionState) => {
    const client = await db.clients.get(clientId);
    if (!client) return;

    await db.clients.update(clientId, {
      positions: client.positions.map(p => 
        p.id === positionId ? { ...p, state: newState } : p
      )
    });
  };

  const deletePosition = async (clientId: string, positionId: string) => {
    const client = await db.clients.get(clientId);
    if (!client) return;

    await db.clients.update(clientId, {
      positions: client.positions.filter(p => p.id !== positionId)
    });
  };

  const deleteConversation = async (clientId: string, conversationId: string) => {
    const client = await db.clients.get(clientId);
    if (!client) return;

    await db.clients.update(clientId, {
      conversations: client.conversations.filter(conv => conv.id !== conversationId)
    });
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
        {activeTab === 'clients' && (
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">My Clients</h1>
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
        )}

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
    </div>
  );
}
