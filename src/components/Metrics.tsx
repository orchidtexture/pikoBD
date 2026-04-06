import React from 'react';
import { Building2, Briefcase, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface MetricsProps {
  stats: {
    totalClients: number;
    activePositions: number;
    filledPositions: number;
    weeklyStatusChecks: number;
  };
}

export const Metrics: React.FC<MetricsProps> = ({ stats }) => {
  const metricsData = [
    { label: 'Total Clients', value: stats.totalClients, icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { 
      label: 'Active Positions', 
      value: stats.activePositions, 
      icon: Briefcase, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      goal: 5,
      showProgress: true 
    },
    { label: 'Filled This Month', value: stats.filledPositions, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Weekly Status Checks', value: stats.weeklyStatusChecks, icon: Zap, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <motion.div
      key="metrics"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 px-1">Performance Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 transition-colors duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                  {stat.goal && <span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">/ {stat.goal}</span>}
                </p>
              </div>
            </div>
            
            {stat.showProgress && stat.goal && (
              <div className="space-y-1.5">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stat.value / stat.goal) * 100, 100)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      stat.value >= stat.goal ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex justify-between">
                  <span>Weekly Goal Progress</span>
                  <span className={cn(stat.value >= stat.goal ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                    {stat.value >= stat.goal ? "Goal Met!" : `${stat.goal - stat.value} more needed`}
                  </span>
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
