export type PositionState = 'Lead' | 'Qualified' | 'In Progress' | 'Closed' | 'Filled';

export interface Position {
  id: string;
  title: string;
  state: PositionState;
  createdAt: string;
  notes?: string;
}

export interface Conversation {
  id: string;
  date: string; // ISO string for date and time
  memo: string;
  positionIds: string[]; // IDs of related positions from the same client
  isNeedsCheck: boolean; // Whether this conversation was to check for new needs
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  positions: Position[];
  conversations: Conversation[];
  lastContactedAt?: string;
  createdAt: string;
}
