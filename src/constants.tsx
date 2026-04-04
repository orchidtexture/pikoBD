import React from 'react';
import { AlertCircle, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { PositionState } from './types';

export const STORAGE_KEY = 'recruitflow_bd_data';

export const STATE_COLORS: Record<PositionState, string> = {
  'Lead': 'bg-blue-100 text-blue-700 border-blue-200',
  'Qualified': 'bg-purple-100 text-purple-700 border-purple-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  'Filled': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Closed': 'bg-slate-100 text-slate-700 border-slate-200',
};

export const STATE_ICONS: Record<PositionState, React.ReactNode> = {
  'Lead': <AlertCircle className="w-3 h-3" />,
  'Qualified': <ArrowUpRight className="w-3 h-3" />,
  'In Progress': <Clock className="w-3 h-3" />,
  'Filled': <CheckCircle2 className="w-3 h-3" />,
  'Closed': <XCircle className="w-3 h-3" />,
};
