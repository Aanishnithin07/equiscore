import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface ScoreDistributionChartProps {
    data: { name: string; count: number; color: string }[];
    medianScore: number;
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ data, medianScore }) => {
    
    // Custom tooltip to style the recharts output in dark mode
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl outline-none">
                    <p className="text-slate-200 font-bold mb-1">{label}</p>
                    <p className="text-slate-400 text-sm">
                        <span className="font-bold text-white">{payload[0].value}</span> Teams
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={{ stroke: '#334155' }}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
                    
                    <ReferenceLine 
                        x={medianScore && data.find(d => parseInt(d.name.split('-')[0]) <= medianScore && parseInt(d.name.split('-')[1] || '100') >= medianScore)?.name}
                        stroke="#00D4AA" 
                        strokeDasharray="3 3"
                        label={{ position: 'top', value: 'Median', fill: '#00D4AA', fontSize: 12 }} 
                    />

                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
