import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: typeof LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  valueColor?: string; // e.g. text-amber-400
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, valueColor = 'text-white' }) => {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
           <Icon className="w-4 h-4 text-amber-400" />
        </div>
      </div>
      <div>
        <p className={`text-3xl font-mono font-bold ${valueColor}`}>{value}</p>
        {trend && (
           <p className="mt-2 text-xs font-medium flex items-center">
             <span className={trend.isPositive ? 'text-teal-400' : 'text-coral-500'}>
               {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
             </span>
             <span className="text-slate-500 ml-1">vs last week</span>
           </p>
        )}
      </div>
    </div>
  );
};
